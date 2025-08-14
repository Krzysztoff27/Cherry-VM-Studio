#!/usr/bin/env bash
###############################
#      root rights check
###############################
# Test to ensure that script is executed with root priviliges
if [[ $EUID -ne 0 ]]; then
    printf '[!] Insufficient priviliges! Please run the script with root rights.\n'
    exit 1
fi

###############################
#       env variables
###############################
readonly INSTALLER_ROOTPATH='./installer-files'
readonly ENV_FILE="${INSTALLER_ROOTPATH}/env.sh"

# Source all env variables
if [ ! -r "$ENV_FILE" ]; then
    printf '[!] Cannot read env.sh file. Check files integrity and try again.\n'
    exit 1
else
    source "$ENV_FILE"
fi
###############################
#       prerequisites
###############################
# Temp file for storing error output from executed commands. Used to pipe errors into error msgboxes after confirming dialog presence.
# Otherwise it just stores the errors without fetching them.
ERR_LOG=$(mktemp)

# Fetch hostname of the host OS that the Cherry VM Studio stack will run on. Crucial for cert generation, DNS resolution
HOSTNAME=$(cat /proc/sys/kernel/hostname)

# Determine Linux distro to adjust settings accordingly
if [ ! -r /etc/os-release ]; then
    printf '[!] Cannot read /etc/os-release file. Check files integrity and try again.\n'
    exit 1
else
    source '/etc/os-release'
fi

# PackageKit is problematic when using underlying package manager.
# While pkcon may be quicker to use, sometimes it's absent on server distros. Therefore manual detection is implemented.
packagekit_off(){
    if systemctl -q is-active packagekit; then
        PKCON_WAS_ACTIVE=true;
        printf '[i] Disabling PackageKit to prevent errors. It will be restored after installation.\n'
        if ! systemctl -q stop packagekit || ! systemctl -q disable packagekit; then
            printf '[!] Failed to disable PackageKit. Check the error and try again.\n'
            exit 1
        fi
        printf '[i] PackageKit stopped and disabled succesfully.\n'
    else
        PKCON_WAS_ACTIVE=false;
    fi
    
}
# Disable PackageKit even before checking the distro and installing dialog
packagekit_off

packagekit_restore(){
    if [[ "$PKCON_WAS_ACTIVE" == true ]]; then
        printf '[i] Re-enabling PackageKit.\n'
        if ! systemctl -q enable packagekit || ! systemctl -q start packagekit; then
            printf '[!] Failed to re-enable PackageKit. Check the error and try again.\n'
            exit 1
        fi
        printf '[i] PackageKit re-enabled and started succesfully.\n'
    fi
}

# Check whether the dialog necessary to run windowed installation is present. If not - install later on. 
check_dialog(){
    if ( ! command -v dialog &>/dev/null ); then
        printf '[!] Dialog not detected. Installing dependency to support TUI based windowed script.\n'
        return 0
    fi
}

install_wrapper(){
    local -n packages=$1
    local -n install=$2
    printf 'Starting...\n'
    for package in "${packages[@]}"; do
        printf 'Installing %s: ' "$package"
        $install "$package" >/dev/null 2>>"$ERR_LOG"
        printf 'OK\n'
    done
    printf 'All packages installed succesfully!\n'
}

#Identify distro and package manager
if [[ "$ID" == "ubuntu" || "$ID" == "debian" || "$ID_LIKE" =~ "debian" ]]; then
    PKG_MANAGER="apt-get"
    PKG_INSTALL="$PKG_MANAGER install -y"
    PKG_UPDATE="$PKG_MANAGER update"

    if ! $PKG_UPDATE >/dev/null; then
        printf '[!] Failed to update packages. Check the error and try again.\n' >&2
        exit 1
    fi

    install_packages(){
        PACKAGES=("qemu-kvm" "libvirt-daemon-system" "libvirt-clients" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }

elif [[ "$ID" == "centos" || "$ID" == "rhel" || "$ID" == "fedora" || "$ID_LIKE" =~ "rhel" || "$ID_LIKE" =~ "fedora" ]]; then
    if ( command -v dnf &>/dev/null ); then
        PKG_MANAGER="dnf"
    elif (command -v yum &>/dev/null); then
        PKG_MANAGER="yum" # "yum" for older RHEL/CentOS
    fi

    PKG_INSTALL="$PKG_MANAGER install -y"

    install_packages(){
        PACKAGES=("qemu-kvm" "qemu-img" "libvirt-daemon" "libvirt-daemon-driver-qemu" "libvirt-daemon-kvm" "libvirt-client" "bridge-utils")  
        install_wrapper PACKAGES PKG_INSTALL
    }
    
elif [[ "$ID" == "arch" || "$ID_LIKE" =~ "arch" ]]; then
    PKG_MANAGER="pacman"
    PKG_INSTALL="$PKG_MANAGER -S --noconfirm"

    install_packages(){
        PACKAGES=("qemu" "libvirt" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }
    
elif [[ "$ID" == "opensuse-tumbleweed" || "$ID" == "opensuse-leap" || "$ID_LIKE" =~ "suse" ]]; then
    PKG_MANAGER="zypper"
    PKG_UPDATE="$PKG_MANAGER -n refresh"
    PKG_INSTALL="$PKG_MANAGER -n install"

    printf '[!] Updating packages...\n'
    if ! $PKG_UPDATE >/dev/null; then
        printf '[!] Failed to update packages. Check the error and try again.\n' >&2
        exit 1
    fi

    install_packages(){
        PACKAGES=("docker" "docker-compose" "libxslt-tools" "bridge-utils" "kvm_server" "kvm_tools" "yq")
        install_wrapper PACKAGES PKG_INSTALL

        # Obsolete - delete after confirming that universal installation works
        #PACKAGES=("docker" "docker-compose" "libxslt-tools" "bridge-utils")
        #PATTERNS=("kvm_server" "kvm_tools")
        #install_wrapper PATTERNS PTTRN_INSTALL
    }
    
elif [[ "$ID" == "alpine" ]]; then
    PKG_MANAGER="apk"
    PKG_INSTALL="$PKG_MANAGER add"

    install_packages(){ 
        PACKAGES=("qemu" "qemu-img" "qemu-system-x86_64" "libvirt-daemon" "libvirt-client" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }

else
    printf '[!] Unsupported distribution: %s\n' "$PRETTY_NAME"
    exit 1
fi

# Install dialog
if ! check_dialog; then
    if ! "${PKG_INSTALL}" dialog >/dev/null; then
        printf '[!] Failed to install dialog. Check the error and try again.\n' >&2
        exit 1
    fi
fi

###############################
#   system configuration
###############################
# URI for virsh operations performed on the system session of qemu by CherryWorker. Export the variable for use in subshells.
readonly LIBVIRT_DEFAULT_URI='qemu:///system'; export LIBVIRT_DEFAULT_URI # Possibly obsolete here

# General system configuration
check_wicked(){
    if ! systemctl -q is-active wicked; then
        {
            printf 'Your system seems to be using network management tool other than wicked (eg. NetworkManager).\n'
            printf 'Cherry VM Studio currently does not support network management tools other than wicked.\n\n'
            printf 'Wicked cannot be enabled automatically so as not to disrupt current network configuration.\n'
            printf 'In order to install Cherry VM Studio switch to wicked and run the installation again.'
        } >> "$ERR_LOG"
        return 1
    fi
}

prepare_filesystem(){
    printf 'Creating directories and copying files.\n'
    {
        mkdir -p "$STACK_ROOTPATH" # static and config files
        mkdir -p "$TEMP_ROOTPATH" # locks, any kind of dynamically changing files

        mkdir -p "$DIR_LOCK"

        cp "$ENV_FILE_INST" "$STACK_ROOTPATH" # copy env.sh file

        mkdir -p "$DIR_DOCKER_HOST" # docker config directory
        cp -r "$DIR_DOCKER_INST/." "$DIR_DOCKER_HOST" # copy all the container subdirectories from the installer-files

        mkdir -p "$DIR_LIBVIRT_HOST" # libvirt config directory
        cp -r "${DIR_LIBVIRT_INST}/." "$DIR_LIBVIRT_HOST"
        # mkdir -p "$DIR_IMAGE_FILES" # This part is not relevant right now as no VM creation logic is implemented yet
        # mkdir -p "$DIR_VM_INSTANCES"

        mkdir -p "$DIR_SYSTEMD_SERVICES"

    } >/dev/null 2>>"$ERR_LOG"
    printf 'Creating installation lock.\n'
    touch "$CVMS_STACK_LOCK" >/dev/null 2>>"$ERR_LOG"
}

create_system_user(){
    printf 'Creating CherryWorker private system group.\n'
    groupadd -r CherryWorker >/dev/null 2>>"$ERR_LOG"
    printf 'Creating CherryWorker system user.\n'
    useradd -r -m -g CherryWorker -s '/usr/bin/false' -c 'Cherry VM Studio system user.' CherryWorker >/dev/null 2>>"$ERR_LOG"
    printf 'Adding CherryWorker to system groups.\n'
    usermod -a -G docker,libvirt,kvm CherryWorker >/dev/null 2>>"$ERR_LOG"
}

configure_polkit(){
    printf 'Enabling polkit to run on startup.\n'
    systemctl -q enable polkit.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting polkit.\n'
    systemctl -q start polkit.service >/dev/null 2>>"$ERR_LOG"
    printf 'Creating polkit rules for CherryWorker user.\n'
    {
        mkdir -p "$DIR_POLKIT_ACTIONS"
        cp -r "${DIR_POLKIT_ACTIONS_INST}/." "$DIR_POLKIT_ACTIONS"
        mkdir -p "$DIR_POLKIT_RULES"
        cp -r "${DIR_POLKIT_RULES_INST}/." "$DIR_POLKIT_RULES"
    } >/dev/null 2>>"$ERR_LOG"
}

# Random IP subnet generation
rand_between() { 
    printf '%i' "$((RANDOM % ($2 - $1 + 1) + $1))"; 
}

generate_subnet() {
    local IP_SUBNET_RANGE=$1

    case "$IP_SUBNET_RANGE" in
        10)
        printf '%s' "10.$(rand_between 0 255).$(rand_between 0 255).0"
        ;;
        172)
        printf '%s' "172.$(rand_between 16 31).$(rand_between 0 255).0"
        ;;
        192)
        printf '%s' "192.168.$(rand_between 0 255).0"
        ;;
        *)
        printf '%s' "Invalid IP subnet range: $IP_RANGE" 2>>"$ERR_LOG"
        exit 1
        ;;
    esac
}

generate_network(){
    # Usage:
    # NET_RANGE = 10/172/192 - private IPv4 subnet ranges
    # NET_MASK - int value of network mask
    # NET_NAME - network name
    local NET_RANGE=$1
    local NET_MASK=$2
    local NET_NAME=$3
    
    while :; do
        NET_IP="$(generate_subnet "$NET_RANGE")"
        # Check whether any route or interface already uses this network
        if ! ip route | grep -q "$NET_IP"; then
            break
        fi
    done

    if [ ! -f "$SETTINGS_FILE" ]; then
        if ! mkdir -p "$STACK_ROOTPATH" || ! touch "$SETTINGS_FILE"; then
            printf 'Failed to create system settings directory at %s' "$SETTINGS_FILE" >> "$ERR_LOG"
            exit 1
        fi
    fi

    # Check if "networks" section exists in settings file
    if ! grep -s -q '^networks:' "$SETTINGS_FILE"; then
        printf '%s' "networks: {}" >> "$SETTINGS_FILE"
    fi

    # Check if NET_NAME already exists under networks
    if ! yq eval ".networks.$NET_NAME" "$SETTINGS_FILE" | grep -vq "null"; then
        yq eval -i ".networks.$NET_NAME = {
            \"network\": \"$NET_IP\",
            \"netmask\": $NET_MASK
        }" "$SETTINGS_FILE"
    fi
}

create_networks(){
    printf 'Randomising network subnets for virtual network infrastructure.\n'
    {
        generate_network "${NETWORK_RAS['range']}" "${NETWORK_RAS['netmask']}" "${NETWORK_RAS['name']}"
    } >/dev/null 2>>"$ERR_LOG"
    
}

# Daemons configuration
configure_daemon_docker(){

    local domain_name=$1

    printf 'Enabling docker daemon to run on startup.\n'
    systemctl -q enable docker.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting docker daemon.\n '
    systemctl -q start docker.service >/dev/null 2>>"$ERR_LOG" 
    printf 'Creating containers .env files.\n'
    # Prepare containers to run as SYSTEM_WORKER user and avoid usage of default system root account
    {
        SYSTEM_WORKER_UID=$(id -u -r "$SYSTEM_WORKER_USERNAME")
        SYSTEM_WORKER_GID=$(id -g -r "$SYSTEM_WORKER_USERNAME")

        for CONTAINER_DIRECTORY in "${CONTAINER_DIRECTORIES_HOST[@]}"; do
            printf 'SYSTEM_WORKER_UID=%s\n' "$SYSTEM_WORKER_UID" >> "$CONTAINER_DIRECTORY/.env"
            printf 'SYSTEM_WORKER_GID=%s\n' "$SYSTEM_WORKER_GID" >> "$CONTAINER_DIRECTORY/.env"
        done

        printf 'DOMAIN_NAME=%s/n' "$domain_name" >> "${DIR_DOCKER_HOST_CHERRY_PROXY}/.env"
    } 2>>"$ERR_LOG"

    printf 'Creating initial SQL file for Apache Guacamole DB.\n'
    if [ ! -f "$DIR_DOCKER_HOST_CHERRY_DB_DATABASE" ]; then
        mkdir -p "$DIR_DOCKER_HOST_CHERRY_DB_DATABASE" >/dev/null 2>>"$ERR_LOG"
    fi
    docker run -q --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > "${DIR_DOCKER_HOST_CHERRY_DB_DATABASE}/01-initdb.sql" 2>>"$ERR_LOG"
}

configure_daemon_libvirt(){
    printf 'Enabling libvirt monolithic daemon to run on startup.\n'
    systemctl -q enable libvirtd.service >/dev/null 2>>"$ERR_LOG"
    printf 'Enabling libvirt admin UNIX domain socket to run on startup.\n'
    systemctl -q enable libvirtd-admin.socket >/dev/null 2>>"$ERR_LOG"
    printf 'Starting libvirt monolithic daemon.\n'
    systemctl -q start libvirtd.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting libvirt UNIX socket.\n'
    systemctl -q start libvirtd-admin.socket >/dev/null 2>>"$ERR_LOG"
}

create_docker_networks(){
    printf 'Creating internal Docker network.\n'
    docker network create \
     -o "com.docker.network.bridge.enable_icc"="true" \
     -o "com.docker.network.bridge.name"="$NETWORK_DOCKER_INTERNAL_NAME" \
     --driver=bridge \
     --internal "$NETWORK_DOCKER_INTERNAL_NAME" >/dev/null 2>>"$ERR_LOG"

    NETWORK_DOCKER_INTERNAL_SUBNET=$(docker network inspect -f '{{ (index .IPAM.Config 0).Subnet }}' "$NETWORK_DOCKER_INTERNAL_NAME")
    NETWORK_DOCKER_INTERNAL_GATEWAY=$(docker network inspect -f '{{ (index .IPAM.Config 0).Gateway }}' "$NETWORK_DOCKER_INTERNAL_NAME")
    
    if systemctl -q is-active firewalld; then
        printf 'Adding internal Docker network to docker firewalld zone.\n'
        {
            firewall-cmd --add-interface="$NETWORK_DOCKER_INTERNAL_NAME" --zone=docker --permanent
            firewall-cmd --reload
        } >/dev/null 2>>"$ERR_LOG"
    fi

    printf 'Adding internal Docker network firewall rules.\n'
    {
        iptables -I DOCKER-USER -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -I OUTPUT -o "$NETWORK_DOCKER_INTERNAL_NAME" -j DROP
        iptables -I OUTPUT -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -I FORWARD -i "$NETWORK_DOCKER_INTERNAL_NAME" ! -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_SUBNET" -j DROP
    } >/dev/null 2>>"$ERR_LOG"
    iptables-save > /etc/iptables/rules.v4 2>>"$ERR_LOG"
}

create_systemd_services(){
    printf 'Creating custom systemd services.\n'
    {
        cp -r "${DIR_SYSTEMD_SERVICES_INST}/." "$DIR_SYSTEMD_SERVICES"
        systemctl -q --now daemon-reload
    } >/dev/null 2>>"$ERR_LOG"
}

initialize_cherry_vm_studio(){
    printf 'Enabling Cherry VM Studio to run on startup.\n'
    systemctl -q enable cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting Cherry VM Studio stack.\n'
    systemctl -q start cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
}
###############################
# windowed installation part
###############################
# Color definitons for dialog windows
RED='\Z1'
NC='\Z0'
# Exit on error
set -euo pipefail
#Trap EXIT signal to clean messy dialog boxes on exit
dialog_cleanup(){
    packagekit_restore
    tput rmcup
    tput cnorm
    # clear 
    reset # Hangs the terminal for a while, but manages to clear the junk that clear leaves in certain types of terminals
    rm -rf "${ERR_LOG}"
} 
trap dialog_cleanup EXIT
# Trap ERR signal to handle exceptions and exit gracefully
error_handler(){
    dialog --colors --backtitle "Cherry VM Studio" --title "Error Details" --exit-label "Exit" --textbox "$ERR_LOG" 0 0
    exit 1
}
trap error_handler ERR
# Trap SIGINT signal to handle forced exits gracefully
sigint_handler(){
    dialog --backtitle "Cherry VM Studio" --msgbox "Forced to exit!\n\nInstallation was not completed.\nRun the removal script to clean the artefacts and install again." 0 0
    exit 1
}
trap sigint_handler SIGINT
# Prepare for dialog display
clear
tput civis #Hide cursor
tput smcup #Switch to alternate screen buffer

if ! dialog --colors --backtitle "Cherry VM Studio" --title "Installation" --yesno "\nWelcome to the Cherry VM Studio installer.\nYou're about to be guided through the main stack installation.\n\n${RED}It is highly recommended to consult the documentation prior to running the installation!${NC}\n\nWould you like to begin?" 12 100; then
    exit 1
fi

# Ensure that the network stack on the host machine is managed by wicked instead of NetworkManager (mostly important on desktop systems)
check_wicked

# Ask for a valid (sub)domain name
while :; do
    # Show previously hidden cursor to be visible inside the inputbox
    tput cnorm

    DOMAIN_NAME=$(dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --stdout --no-cancel --inputbox "Enter valid (sub)domain name for the Cherry VM Studio stack.\n\nValid input should look like:\n- test.com\n- sub.test.com\n- sub.[...].test.com\n" 0 0)

    if [[ ! "$DOMAIN_NAME" =~ ^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$ ]]; then
        dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --msgbox "Invalid domain name!\n\nPlease try again." 8 50
    else
        # Hide the cursor once again
        tput civis
        dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --msgbox "Domain name accepted: $DOMAIN_NAME" 7 50
        break
    fi

done
# Check for its existence - lookup DNS records
while :; do
    dialog --colors --backtitle "Cherry VM Studio" --title "DNS Configuration" --msgbox "For the provided domain name Cherry VM Studio requires an appropriate wildcard DNS record to be created:\n*.$DOMAIN_NAME IN A <server_ip>\n${RED}This step must be performed manually!${NC}" 0 0

    if ! nslookup "$DOMAIN_NAME" >/dev/null 2>>"$ERR_LOG"; then
        dialog --colors --backtitle "Cherry VM Studio" --title "DNS Configuration" --msgbox "DNS record not found!\n\nPlease try again." 8 50
    else
        break
    fi 
done

install_packages | dialog --colors --backtitle "Cherry VM Studio" --title "Packages installation" --progressbox 20 100;

prepare_filesystem | dialog --colors --backtitle "Cherry VM Studio" --title "Filesystem preparation" --progressbox 20 100;

create_system_user | dialog --colors --backtitle "Cherry VM Studio" --title "System configuration" --progressbox 20 100;

configure_polkit | dialog --colors --backtitle "Cherry VM Studio" --title "Polkit configuration" --progressbox 20 100;

create_networks | dialog --colors --backtitle "Cherry VM Studio" --title "Randomising internal network addresses" --progressbox 20 100;

configure_daemon_docker "$DOMAIN_NAME" | dialog --colors --backtitle "Cherry VM Studio" --title "Docker daemon configuration" --progressbox 20 100;

configure_daemon_libvirt | dialog --colors --backtitle "Cherry VM Studio" --title "Libvirt daemon configuration" --progressbox 20 100;

create_docker_networks | dialog --colors --backtitle "Cherry VM Studio" --title "Docker networks creation" --progressbox 20 100;

create_systemd_services | dialog --colors --backtitle "Cherry VM Studio" --title "Systemd services creation" --progressbox 20 100;

initialize_cherry_vm_studio | dialog --colors --backtitle "Cherry VM Studio" --title "Cherry VM Studio final initialization" --progressbox 20 100;

dialog --colors --backtitle "Cherry VM Studio" --title "Installation complete" --msgbox "Cherry VM Studio was succesfully installed on your system.\nCherry Admin Panel can be accessed at https://${DOMAIN_NAME}.\nShould you encounter any technical issues, feel free to report them to the developers on GitHub." 20 100;
