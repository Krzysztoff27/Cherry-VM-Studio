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
readonly LOGS_DIRECTORY='./logs/cherry-remove/'
LOGS_FILE="${LOGS_DIRECTORY}$(date +%d-%m-%y_%H-%M-%S).log"; readonly LOGS_FILE
#Sourcing env variables
source ./environment/env/directories.env
source ./environment/env/colors.env
#Sourcing utilities
source ./environment/system/utilities.sh
#Removal specific functions
source ./environment/system/remove/general.sh
source ./environment/system/remove/docker.sh
source ./environment/system/remove/daemons.sh
source ./environment/system/remove/libvirt.sh
#URI for virsh operations performed on the system session of qemu by CherryWorker. Export the variable for use in subshells.
readonly LIBVIRT_DEFAULT_URI='qemu:///system'; export LIBVIRT_DEFAULT_URI

###############################
#        prerequisites
###############################
#Create logs directory
mkdir -p "$LOGS_DIRECTORY"
#Redirect stderr output to the logs file globally
exec 2> "$LOGS_FILE"
#Force script to call err_handler on ERR occurence
set -E
#Error handler to call on ERR occurence and print an error message
err_handler(){
    printf "${RED}ERR${NC}\n"
    err_occured=true
}
trap 'err_handler' ERR
#Trap user exit using custom handler
trap 'sigint_handler' SIGINT

###############################
#           removal
###############################
#Calls for certain functions - parts of the whole environment removal process
removal(){
    print_begin_notice
    remove_vm_networks
    #remove_vm_firewall
    #configure_container_guacamole
    #configure_container_traefik
    #configure_container_cherry-api
    #configure_container_cherry-admin-panel
    #remove_docker_networks
    #configure_daemon_docker
    #configure_daemon_libvirt
    #remove_user
    #remove_zypper_patterns
    #remove_zypper_packages
    #final_cleanup
    print_finish_notice
}
removal