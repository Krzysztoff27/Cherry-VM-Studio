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
readonly LOGS_DIRECTORY='./logs/cherry-install/'
LOGS_FILE="${LOGS_DIRECTORY}$(date +%d-%m-%y_%H-%M-%S).log"; readonly LOGS_FILE
#Sourcing env variables
source ./environment/env/directories.env
source ./environment/env/colors.env
source ./environment/env/addresses.env
#Sourcing utilities
source ./environment/system/utilities.sh
#Installation specific functions
source ./environment/system/install/general.sh
source ./environment/system/install/docker.sh
source ./environment/system/install/daemons.sh
source ./environment/system/install/libvirt.sh
#URI for virsh operations performed on the system session of qemu by CherryWorker. Export the variable for use in subshells.
readonly LIBVIRT_DEFAULT_URI='qemu:///system'; export LIBVIRT_DEFAULT_URI

###############################
#        prerequisites
###############################
#Create logs directory
mkdir -p "$LOGS_DIRECTORY"
#Redirect stderr output to the logs file globally
exec 2> "$LOGS_FILE"
#Force script to call err_handler exit on ERR occurence
set -eE
#Error handler to call on ERR occurence and print an error message
err_handler(){
    printf "%sERR%s" "${RED}" "${NC}"
    printf "\n[!] ${RED}An error occured!${NC}\nSee the $LOGS_FILE for specific information.\n"
}
trap 'err_handler' ERR
#Trap user exit using custom handler
trap 'sigint_handler' SIGINT

###############################
#       installation
###############################
#Calls for certain functions - parts of the whole environment initialization process
installation(){
    print_begin_notice
    #disable_network_manager
    #install_zypper_packages
    #install_zypper_patterns
    #create_user
    configure_daemon_libvirt
    #configure_daemon_docker
    #create_docker_networks
    #get_domain_name
    #configure_container_traefik
    #configure_container_guacamole
    #configure_container_cherry-api
    #configure_container_cherry-admin-panel
    #configure_file_ownership
    #create_vm_firewall
    create_vm_networks
    print_finish_notice
}
installation