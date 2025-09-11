#!/usr/bin/env bash
###############################
#    installer directories
###############################
# Installer files and directories - relative paths
INSTALLER_ROOTPATH='./installer-files'

readonly SETTINGS_FILE_INST="${INSTALLER_ROOTPATH}/settings.yaml"; export SETTINGS_FILE_INST
readonly ENV_FILE_INST="${INSTALLER_ROOTPATH}/env.sh"; export ENV_FILE_INST

readonly DIR_DOCKER_INST="${INSTALLER_ROOTPATH}/docker"; export DIR_DOCKER_INST
readonly DIR_DOCKER_INST_TRAEFIK_CONFIG="${DIR_DOCKER_INST}/traefik"; export DIR_DOCKER_INST_TRAEFIK_CONFIG
readonly DIR_LIBVIRT_INST="${INSTALLER_ROOTPATH}/libvirt"; export DIR_LIBVIRT_INST

readonly DIR_SYSTEMD_INST="${INSTALLER_ROOTPATH}/systemd"; export DIR_SYSTEMD_INST
readonly DIR_SYSTEMD_SCRIPTS_INST="${DIR_SYSTEMD_INST}/scripts"; export DIR_SYSTEMD_SCRIPTS_INST
readonly DIR_SYSTEMD_SERVICES_INST="${DIR_SYSTEMD_INST}/services"; export DIR_SYSTEMD_SERVICES_INST

readonly DIR_POLKIT_INST="${INSTALLER_ROOTPATH}/polkit"; export DIR_POLKIT_INST
readonly DIR_POLKIT_ACTIONS_INST="${DIR_POLKIT_INST}/actions"; export DIR_POLKIT_ACTIONS_INST
readonly DIR_POLKIT_RULES_INST="${DIR_POLKIT_INST}/rules"; export DIR_POLKIT_RULES_INST

###############################
# host filesystem directories
###############################
readonly STACK_ROOTPATH='/opt/cherry-vm-studio'; export STACK_ROOTPATH
readonly TEMP_ROOTPATH='/var/opt/cherry-vm-studio'; export TEMP_ROOTPATH

# Settings and env files
readonly SETTINGS_FILE="${STACK_ROOTPATH}/settings.yaml"; export SETTINGS_FILE
ENV_FILE="${STACK_ROOTPATH}/env.sh"; export ENV_FILE

# Docker directories
readonly DIR_DOCKER_HOST="${STACK_ROOTPATH}/docker"
readonly DIR_DOCKER_HOST_INITDB="${DIR_DOCKER_HOST}/initdb"; export DIR_DOCKER_HOST_INITDB
readonly DIR_DOCKER_HOST_DB="${TEMP_ROOTPATH}/database"; export DIR_DOCKER_HOST_DB
readonly DIR_DOCKER_SECRETS="${DIR_DOCKER_HOST}/secrets"; export DIR_DOCKER_SECRETS
readonly DIR_DOCKER_HOST_TRAEFIK_CONFIG="${TEMP_ROOTPATH}/traefik"; export DIR_DOCKER_HOST_TRAEFIK_CONFIG

# Libvirt and VM directories
readonly DIR_LIBVIRT_HOST="${STACK_ROOTPATH}/libvirt"; export DIR_LIBVIRT_HOST
readonly DIR_IMAGE_FILES="${STACK_ROOTPATH}/image-files"; export DIR_IMAGE_FILES
readonly DIR_VM_INSTANCES="${TEMP_ROOTPATH}/virtual-machines"; export DIR_VM_INSTANCES

# Polkit directories
readonly DIR_POLKIT_ACTIONS='/usr/share/polkit-1/actions'; export DIR_POLKIT_ACTIONS
readonly DIR_POLKIT_RULES='/etc/polkit-1/rules.d'; export DIR_POLKIT_RULES

# Systemd directories
readonly DIR_SYSTEMD_SERVICES='/etc/systemd/system'; export DIR_SYSTEMD_SERVICES
readonly DIR_CVMS_SYSTEMD_SCRIPTS="${STACK_ROOTPATH}/systemd"; export DIR_CVMS_SYSTEMD_SCRIPTS

# Custom netns directory
#network namespace name for the Cherry Remote Access Services Bus
# readonly NS_RASBUS='cherry-rasBus'; export NS_RASBUS
readonly DIR_NETNS='/var/run/netns'; export DIR_NETNS
# readonly DIR_NS_RASBUS="${DIR_NETNS}/${NS_RASBUS}"; export DIR_NS_RASBUS


###############################
#           locks
###############################
readonly DIR_LOCK="${TEMP_ROOTPATH}/locks"; export DIR_LOCK

# Locks the existence of the Cherry VM Studio stack - created during the installation. Is present on the system regardless of the systemd services status.
readonly CVMS_INSTALLATION_LOCK="${DIR_LOCK}/cherry-vm-studio.lock"; export CVMS_INSTALLATION_LOCK

# Signifies that systemd cherry-vm-studio service (the stack) is running.
readonly CVMS_SERVICE_LOCK="${DIR_LOCK}/cherry-vm-studio.service.lock"; export CVMS_SERVICE_LOCK

###############################
#     logger constants
###############################
readonly CVMS_SERVICE_LOG_TAG='Cherry-VM-Studio'; export CVMS_SERVICE_LOG_TAG
readonly CVMS_WATCHDOG_LOG_TAG='cherry-watchdog'; export CVMS_WATCHDOG_LOG_TAG

###############################
#       container names
###############################
readonly CONTAINER_PANEL='cherry-admin-panel'; export CONTAINER_PANEL
readonly CONTAINER_API='cherry-api'; export CONTAINER_API
readonly CONTAINER_GUACAMOLE='cherry-guacamole'; export CONTAINER_GUACAMOLE
readonly CONTAINER_GUACD='cherry-guacd'; export CONTAINER_GUACD
readonly CONTAINER_DB='cherry-db'; export CONTAINER_DB
readonly CONTAINER_PROXY='cherry-proxy'; export CONTAINER_PROXY

readonly CONTAINER_NAMES=(
    "$CONTAINER_PANEL"
    "$CONTAINER_API"
    "$CONTAINER_GUACAMOLE"
    "$CONTAINER_GUACD"
    "$CONTAINER_DB"
    "$CONTAINER_PROXY"
); export CONTAINER_NAMES

###############################
#       system worker
###############################
readonly SYSTEM_WORKER_USERNAME='CherryWorker'; export SYSTEM_WORKER_USERNAME
readonly SYSTEM_WORKER_GROUPNAME='CherryWorker'; export SYSTEM_WORKER_GROUPNAME
readonly SYSTEM_WORKER_HOME_DIR="${STACK_ROOTPATH}/${SYSTEM_WORKER_USERNAME}"; export SYSTEM_WORKER_HOME_DIR

###############################
#     watched containers 
# (for cherry-watchdog service)
###############################
readonly WATCHED_CONTAINERS=(
    "$CONTAINER_API"
    "$CONTAINER_GUACD"
); export WATCHED_CONTAINERS

###############################
# apache guacamole db user
###############################
readonly POSTGRESQL_DATABASE='guacamole'; export POSTGRESQL_DATABASE
readonly POSTGRESQL_USER='guacadmin'; export POSTGRESQL_USER
readonly POSTGRESQL_PASSWORD='guacadmin'; export POSTGRESQL_PASSWORD

###############################
#       Docker volumes
###############################
readonly VOLUME_DB='cherry_db'; export VOLUME_DB

###############################
#virtual network infrastructure
###############################
# Networks
readonly NETWORK_RAS_NAME='cherry-ras-network'; export NETWORK_RAS_NAME
readonly NETWORK_RAS_RANGE=10; export NETWORK_RAS_RANGE
readonly NETWORK_RAS_NETMASK=28; export NETWORK_RAS_NETMASK

#TODO Same as above - decide which to remove
declare -rA NETWORK_RAS=(
    ['name']='cherry-ras-network'
    ['range']=10
    ['netmask']=28
); export NETWORK_RAS

readonly NETWORK_DOCKER_INTERNAL_NAME='cherry-internal'; export NETWORK_DOCKER_INTERNAL_NAME

# IPv4 address suffixes (independent of the network part of the address which is randomized in order to avoid conflicts with existing networks)
readonly SUFFIX_VETH_EXT_RASBUS=1; export SUFFIX_VETH_EXT_RASBUS
readonly SUFFIX_BR_RASBR=2; export SUFFIX_BR_RASBR
readonly SUFFIX_VETH_API_RASBUS=3; export SUFFIX_VETH_API_RASBUS
readonly SUFFIX_VETH_GUACD_RASBUS=4; export SUFFIX_VETH_GUACD_RASBUS

# VETH pairs
readonly VETH_API_RASBUS='api-rasBus'; export VETH_API_RASBUS
readonly VETH_RASBUS_API='rasBus-api'; export VETH_RASBUS_API

readonly VETH_GUACD_RASBUS='guacd-rasBus'; export VETH_GUACD_RASBUS
readonly VETH_RASBUS_GUACD='rasBus-guacd'; export VETH_RASBUS_GUACD

#vmBr is a bridge connecting all of the VM guests to the rest of the remote access infrastructure as well as the Internet
readonly VETH_VMBR_RASBUS='vmBr-rasBus'; export VETH_VMBR_RASBUS
readonly VETH_RASBUS_VMBR='rasBus-vmBr'; export VETH_RASBUS_VMBR
#ext veth end acts as an endpoint allowing Internet access for the guest VMs
readonly VETH_EXT_RASBUS='ext-rasBus'; export VETH_EXT_RASBUS
readonly VETH_RASBUS_EXT='rasBus-ext'; export VETH_RASBUS_EXT

#dedicated link for TLS socket communication with libvirt daemon
readonly VETH_LIBVIRT_RASBUS='libvirt-rasBus'; export VETH_LIBVIRT_RASBUS
readonly VETH_RASBUS_LIBVIRT='rasBus-libvirt'; export VETH_RASBUS_LIBVIRT

# Network namespaces


# Network bridges
#bridge that connects all of the VM guests to the rest of the remote access infrastructure as well as the Internet
readonly BR_VMBR='cherry-vmBr'; export BR_VMBR

#bridge inside the NS_RASBUS namespace that connects Cherry-API, Guacamole Guacd containers
readonly BR_RASBR='cherry-rasBr'; export BR_RASBR

# Associate two VETH ends
#TODO Unify with the rest of arrays to use direct expansion. Modify creation functions.
readonly VETH_PAIRS=(
    "VETH_API_RASBUS VETH_RASBUS_API"
    "VETH_GUACD_RASBUS VETH_RASBUS_GUACD"
    "VETH_VMBR_RASBUS VETH_RASBUS_VMBR"
    "VETH_EXT_RASBUS VETH_RASBUS_EXT"
); export VETH_PAIRS