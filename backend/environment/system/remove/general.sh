#!/usr/bin/env bash

print_begin_notice(){
    printf "$(cat ./messages/cherry-remove_begin.txt)"
    printf '\n[?] Continue (y/n): '
    read -r -n 1 -p '' continue_execution
        if [[ "$continue_execution" != 'y' ]]; then
            printf '\n[!] Removal aborted! Exiting.\n'
            exit 1
        fi
    printf '\n'
}

print_finish_notice(){
    if [[ "$err_occured" == true ]]; then
        printf "\n${YELLOW}The removal script has finished its job, but some tasks failed to run succesfully.${NC}"
        printf "\nSee the $LOGS_FILE for specific information."
        printf '\nIt is recommended to remove the remaining components of the Cherry VM Manager stack manually.\n'
    else
        printf "\n${GREEN}The removal script has finished its job without any errors.${NC}"
        printf '\nAll components of the Cherry VM Manager stack have been removed succesfully!\n'
    fi
}

remove_zypper_packages(){
    read_file "$ZYPPER_PACKAGES"
    if systemctl list-unit-files | grep -q '^packagekit\.service'; then
        printf '\n[i] Disabling PackageKit to prevent Zypper errors: '
        systemctl -q stop packagekit
        systemctl -q disable packagekit
        ok_handler
    else
        printf '\n[i] PackageKit not detected. Settings have not been modified.'
    fi
    for line in "${packages[@]}"; do
        clean_line="${line//[^[:alnum:]-]/}"
        printf "[i] Removing $clean_line: "
        zypper -n -q remove -t package "$clean_line" 
        ok_handler
    done
}

remove_zypper_patterns(){
    read_file "$ZYPPER_PATTERNS"
    for line in "${packages[@]}"; do
        clean_line="${line//[^[:alnum:]_]/}"
        printf "[i] Removing $clean_line: "
        zypper -n -q remove -t pattern "$clean_line"
        ok_handler
    done
}

remove_user(){
    printf '\n[i] Removing CherryWorker from system groups: '
    usermod -G '' CherryWorker
    ok_handler
    printf '[i] Removing CherryWorker system user: '
    userdel -f -r 'CherryWorker' >> "$LOGS_FILE"
    ok_handler
    printf '[i] Removing CVMM system group: '
    groupdel -f 'CVMM'
    ok_handler
    printf '[i] Removing /etc/sudoers.d/cherryworker file: '
    rm --interactive=never -r -f /etc/sudoers.d/cherryworker
    ok_handler
}

final_cleanup(){
    rm --interactive=never -r -f '/opt/cherry-vm-manager'
    rm --interactive=never -r -f '/var/opt/cherry-vm-manager'
}

