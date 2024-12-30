#!/usr/bin/env bash

###############################
#      root rights check
###############################

#Test to ensure that script is executed with root priviliges
if ((EUID != 0)); then
    printf '[!] Insufficient priviliges! Please run the script with root rights.\n'
    exit
fi

###############################
#       env variables
###############################

#Environmental variables - paths to files storing installation logs and dependencies names to be installed
readonly LOGS_DIRECTORY='./logs/cherry-install/'
LOGS_FILE="${LOGS_DIRECTORY}$(date +%d-%m-%y_%H-%M-%S).log"; readonly LOGS_FILE
readonly ZYPPER_PACKAGES='./dependencies/zypper_packages.txt'
readonly ZYPPER_PATTERNS='./dependencies/zypper_patterns.txt'
readonly DIR_CVMM_OPT='/opt/cherry-vm-manager/'
readonly DIR_IMAGE_FILES='/opt/cherry-vm-manager/image-files/'
readonly DIR_LIBVIRT='/opt/cherry-vm-manager/libvirt/'
readonly DIR_DOCKER='/opt/cherry-vm-manager/docker/'
readonly VM_INSTANCES='/var/opt/cherry-vm-manager/virtual-machines/'

#Color definitions for distinguishable status codes
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[0;33m'
readonly NC='\033[0m'

#URI for virsh operations performed on the system session of qemu by CherryWorker
readonly VIRSH_DEFAULT_CONNECTION_URI='qemu:///system'

###############################
#      utility functions
###############################

#Create logs directory
mkdir -p "$LOGS_DIRECTORY"

#Redirect stderr output to the logs file globally
exec 2> "$LOGS_FILE"

#Force script to call err_handler exit on ERR occurence
set -eE

#Error handler to call on ERR occurence and print an error message
err_handler(){
    printf "${RED}ERR${NC}"
    printf "\n[!] ${RED}An error occured!${NC}\nSee the $LOGS_FILE for specific information.\n"
}
trap 'err_handler' ERR

#Error handler to call on SIGINT occurence and print an error message
sigint_handler(){
    printf '\n[!] Script terminated manually!\n'
    exit 1
}
trap 'sigint_handler' SIGINT

#Return OK status only if previous command returned 0 code, otherwise err_handler is invoked
ok_handler(){
    if [ $? == 0 ]; then
        printf "${GREEN}OK${NC}\n"
    fi
}

#Universal function to read dependenies names from a file
read_file(){
    packages=()
    while IFS= read -r line || [[ -n "$line" ]]; do
        packages+=("$line")
    done < "$1"
}

###############################
#   installation functions
###############################

disable_network_manager(){
    if systemctl -q is-active NetworkManager; then
        printf '\n[!] NetworkManager is currently managing network connections on the host OS.'
        printf '\n[!] In order to install Cherry VM Manager switch to wicked and run the cherry-install.sh script again.\n'
        exit 1
    else
        if systemctl -q is-active wicked; then
        printf '\n[i] Wicked is currently managing network connections on the host OS.'
        printf '\n[i] Settings have not been modified.\n'
        else
            printf '\n[!] Unrecognized network manager on the host OS.'
            printf '\n[!] In order to install Cherry VM Manager switch to wicked and run the cherry-install.sh script again.\n'
            exit 1
        fi
    fi
}

install_zypper_packages(){
    read_file "$ZYPPER_PACKAGES"
    if systemctl -q is-active packagekit; then
        printf '\n[i] Disabling PackageKit to prevent Zypper errors: '
        systemctl -q stop packagekit
        systemctl -q disable packagekit
        ok_handler
    else
        printf '\n[i] PackageKit inactive or not present. Settings have not been modified.'
    fi
    printf '\n[i] Refreshing zypper repositories: '
    zypper -n -q refresh > "$LOGS_FILE"
    ok_handler
    for line in "${packages[@]}"; do
        clean_line="${line//[^[:alnum:]-]/}"
        printf "[i] Installing $clean_line: "
        zypper -n -q install -t package "$clean_line" 
        ok_handler
    done
}

install_zypper_patterns(){
    read_file "$ZYPPER_PATTERNS"
    for line in "${packages[@]}"; do
        clean_line="${line//[^[:alnum:]_]/}"
        printf "[i] Installing $clean_line: "
        zypper -n -q install -t pattern "$clean_line"
        ok_handler
    done
}

create_user(){
    printf '\n[i] Creating CVMM system group: '
    groupadd -f -r 'CVMM'
    ok_handler
    printf '[i] Creating CherryWorker system user: '
    useradd -r -M -s '/usr/bin/false' -c 'Cherry-VM-Manager system user' 'CherryWorker'
    ok_handler
    printf '[i] Changing CherryWorker primary group: '
    usermod -g 'CVMM' 'CherryWorker'
    ok_handler
    printf '[i] Creating CherryWorker home directory: '
    mkdir /home/CherryWorker
    chown CherryWorker:CVMM /home/CherryWorker
    chmod 700 /home/CherryWorker
    ok_handler
    printf '[i] Adding CherryWorker to system groups: '
    usermod -a -G docker,libvirt,kvm CherryWorker
    ok_handler
    printf '[i] Adding /etc/sudoers.d/cherryworker file: '
    echo "CherryWorker ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/cherryworker > "$LOGS_FILE"
    chmod 440 /etc/sudoers.d/cherryworker
    ok_handler 
}

#Function to check for nested virtualization support and state on the host system.
#For nested-v to work it needs to be specified in the kvm daemon settings prior to enabling libvirt service
#and kvm kernel modules need to be reloaded.
configure_daemon_kvm(){
    cpu_model=$(grep "model name" /proc/cpuinfo -m 1 | awk -F: '{print $2}';)
    if echo "$cpu_model" | grep -q -i "Intel"; then
        cpu_producer='intel'
        if (grep -q "vmx" /proc/cpuinfo); then
            nested_support=true
        fi
    elif echo "$cpu_model" | grep -q -i "AMD"; then
        cpu_producer='amd'
        if (grep -q "svm" /proc/cpuinfo); then
            nested_support=true
        fi
    else
        printf '\nUnrecognized CPU, cannot proceed with KVM configuration.' > "$LOGS_FILE"
        exit 1 
    fi

    nested_state=$(cat /sys/module/kvm_"$cpu_producer"/parameters/nested)
    if [[ "$nested_support" == true ]]; then
        printf '\n'
        if [[ "$nested_state" != 'Y' ]]; then
            read -r -p '[?] Detected nested virtualization support. Enable? (y/n): ' enable_nested
            if [[ "$enable_nested" == 'y' ]]; then
                modprobe -r kvm_"$cpu_producer"
                modprobe kvm_"$cpu_producer" nested=1
                echo "options kvm_$cpu_producer nested=1" > '/etc/modprobe.d/kvm.conf'
                printf '[i] Nested virtualization enabled.\n'
            else
                printf '[i] Nested virtualization not enabled.\n'
            fi
        else
            printf '[i] Nested virtualization enabled prior to installation. Settings have not been modified.\n'
        fi
    fi
}

configure_daemon_libvirt(){
    printf '[i] Enabling libvirt monolithic daemon to run on startup: '
    systemctl -q enable libvirtd.service
    ok_handler
    printf '[i] Starting libvirt monolithic daemon: '
    systemctl -q start libvirtd.service 
    ok_handler
    printf "[i] Creating directory structure ($DIR_LIBVIRT) and copying vm infrastructure .xml files: "
    mkdir -p "$DIR_LIBVIRT"
    cp -r ../libvirt/. "$DIR_LIBVIRT"
    ok_handler
    printf "[i] Creating directory structure ($VM_INSTANCES): "
    mkdir -p "$VM_INSTANCES"
    ok_handler
}

configure_daemon_docker(){
    printf '\n[i] Enabling docker daemon to run on startup: '
    systemctl -q enable docker.service 
    ok_handler
    printf '[i] Starting docker daemon: '
    systemctl -q start docker.service 
    ok_handler
    printf "[i] Creating directory structure ($DIR_DOCKER) and copying docker files: "
    mkdir -p "$DIR_DOCKER"
    cp -r ../docker/. "$DIR_DOCKER"
    ok_handler
    #Add copying of the files from api/docker and react-admin-panel/docker after building their images
    printf '[i] Copying docker files for Cherry API: '
    mkdir -p "${DIR_DOCKER}cherry-api"
    cp -r '../../api/api/docker/.' "${DIR_DOCKER}cherry-api"
    ok_handler
    printf '[i] Copying Cherry Admin Panel files for image build: '
    mkdir -p "${DIR_IMAGE_FILES}cherry-admin-panel"
    cp -r '../../react-admin-panel/react-admin-panel/.' "${DIR_IMAGE_FILES}cherry-admin-panel"
    ok_handler
    printf '[i] Copying docker files for Cherry Admin Panel: '
    mkdir -p "${DIR_DOCKER}cherry-admin-panel"
    cp -r '../../react-admin-panel/react-admin-panel/docker/.' "${DIR_DOCKER}cherry-admin-panel"
    ok_handler
}

create_docker_networks(){
    printf '\n[i] Creating cvmm-internal Docker network: '
    runuser -u CherryWorker -- docker network create -o "com.docker.network.bridge.enable_icc"="true" -o "com.docker.network.bridge.name"="cvmm-internal" --driver=bridge --subnet=172.16.100.0/24 --gateway=172.16.100.1 --internal cvmm-internal > "$LOGS_FILE"
    ok_handler
    printf '\n[i] Adding cvmm-internal Docker network to docker firewall zone: '
    runuser -u CherryWorker -- sudo firewall-cmd --add-interface=cvmm-internal --zone=docker --permanent > "$LOGS_FILE"
    runuser -u CherryWorker -- sudo firewall-cmd --reload > "$LOGS_FILE"
    ok_handler
}

get_domain_name(){
    while true; do
        printf '\n[?] Enter the domain name for the Cherry VM Manager stack: '
        read -r -p '' domain_name
        if [[ ! $domain_name =~ ^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$ ]]; then
            printf '[!] Invalid domain name!\n'
        else
            break
        fi
    done
}

configure_container_traefik(){
    printf '\n[i] Creating .env file for traefik docker container: '
    runuser -u CherryWorker -- printf "DOMAIN_NAME=%s\n" "$domain_name" > "${DIR_DOCKER}traefik/.env" 
    ok_handler
    printf '[i] Starting traefik docker container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}traefik/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_guacamole(){
    printf '\n[i] Creating initdb.sql SQL script for Apache Guacamole PostgreSQL db: '
    runuser -u CherryWorker -- docker run -q --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > "${DIR_DOCKER}apache-guacamole/initdb/01-initdb.sql"
    ok_handler
    printf '[i] Starting apache-guacamole docker stack: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}apache-guacamole/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_cherry-api(){
    #Add image build if the image is not supplied externally
    printf '\n[i] Starting Cherry API container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}cherry-api/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_cherry-admin-panel(){
    if ! docker images -q cherry-admin-panel > "$LOGS_FILE"; then
        printf '\n[i] Creating Cherry Admin Panel .env variables: '
        VITE_API_BASE_URL=$(printf "VITE_API_BASE_URL=http://%s/api\n" "$domain_name")
        VITE_API_WEBSOCKET_URL=$(printf "VITE_API_WEBSOCKET_URL=ws://%s/api\n" "$domain_name")
        VITE_TRAEFIK_PANEL_URL=$(printf "VITE_TRAEFIK_PANEL_URL=http://traefik.%s/dashboard/\n" "$domain_name")
        VITE_GUACAMOLE_PANEL_URL=$(printf "VITE_GUACAMOLE_PANEL_URL=http://%s/guacamole\n" "$domain_name")
        ok_handler
        printf '[i] Building Cherry Admin Panel docker image: '
        cd "${DIR_IMAGE_FILES}cherry-admin-panel"
        runuser -u CherryWorker -- "./build.sh" \
        "$VITE_API_BASE_URL" \
        "$VITE_API_WEBSOCKET_URL" \
        "$VITE_TRAEFIK_PANEL_URL" \
        "$VITE_GUACAMOLE_PANEL_URL"
        cd -
        ok_handler
    fi
    printf '[i] Starting Cherry Admin Panel container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}cherry-admin-panel/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_file_ownership(){
    printf '\n[i] Changing file ownership: '
    #Change ownership of CVMM stack filesystem to CherryWorker:CVMM
    chown -R CherryWorker:CVMM /opt/cherry-vm-manager
    chown -R CherryWorker:CVMM /var/opt/cherry-vm-manager
    #Set ACLs to ensure that any directory or file created in CVMM stack filesystem will be owned by CherryWorker user
    setfacl -R -m d:u:CherryWorker:rwx /opt/cherry-vm-manager
    setfacl -R -m d:u:CherryWorker:rwx /var/opt/cherry-vm-manager
    #Set ACLs to ensure that any directory or file created in CVMM stack filesystem will be owned by CVMM group
    setfacl -R -m d:g:CVMM:rwx /opt/cherry-vm-manager
    setfacl -R -m d:g:CVMM:rwx /var/opt/cherry-vm-manager
    ok_handler
}

create_vm_networks(){
    printf '\n[i] Disabling libvirt default network stack on host OS: '
    runuser -u CherryWorker -- virsh net-undefine --network default > "$LOGS_FILE"
    runuser -u CherryWorker -- virsh net-destroy --network default > "$LOGS_FILE"
    ok_handler
    printf '\n[i] Creating a default NAT network for VMs and making it persistent: '
    runuser -u CherryWorker -- virsh net-define --file "${DIR_LIBVIRT}networks/isolated-nat.xml" > "$LOGS_FILE"
    runuser -u CherryWorker -- virsh net-start --network isolated-nat > "$LOGS_FILE"
    runuser -u CherryWorker -- virsh net-autostart --network isolated-nat > "$LOGS_FILE"
    ok_handler 
}

create_vm_firewall(){
    printf '\n[i] Creating network filter to restrict communication between VMs on a shared NAT network: '
    runuser -u CherryWorker -- virsh nwfilter-define --file "${DIR_LIBVIRT}filters/isolated-nat-filter.xml" > "$LOGS_FILE"
    ok_handler
}

print_begin_notice(){
    printf "$(cat ./messages/cherry-install_begin.txt)"
    printf '\n[?] Continue (y/n): '
    read -r -n 1 -p '' continue_execution
        if [[ "$continue_execution" != 'y' ]]; then
            printf '\n[!] Installation aborted! Exiting.\n'
            exit 1
        fi
    printf '\n'
}

print_finish_notice(){
    printf '\nThe installation script has finished its job without any errors.\n'
    printf "\nThe Cherry VM Manager stack can be controlled using\n the Cherry Admin Panel available at ${GREEN}${domain_name}${NC}.\n"
}

###############################
#       installation
###############################

#Calls for certain functions - parts of the whole environment initialization process

#Parts invoked in one function to allow implementation of stage installation - each stage
#will record its completion state and if error occurs and another installation is launched,
#it will be able to continue from where it stopped previously - TO BE IMPLEMENTED
installation(){
    print_begin_notice
    #disable_network_manager
    #install_zypper_packages
    #install_zypper_patterns
    #create_user
    #configure_daemon_kvm
    #configure_daemon_libvirt
    configure_daemon_docker
    create_docker_networks
    get_domain_name
    configure_container_traefik
    configure_container_guacamole
    configure_container_cherry-api
    configure_container_cherry-admin-panel
    configure_file_ownership
    #create_vm_firewall
    #create_vm_networks
    print_finish_notice
}
installation