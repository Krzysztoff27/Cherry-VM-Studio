#!/usr/bin/env bash

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
    printf "\nThe Cherry VM Manager stack can be controlled using the Cherry Admin Panel available at ${GREEN}${domain_name}${NC}.\n"
}

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

