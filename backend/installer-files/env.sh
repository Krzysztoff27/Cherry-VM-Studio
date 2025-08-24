#!/usr/bin/env bash
###############################
#    installer directories
###############################
# Installer files and directories - relative paths
readonly INSTALLER_ROOTPATH='./installer-files'

readonly SETTINGS_FILE_INST="${INSTALLER_ROOTPATH}/settings.yaml"; export SETTINGS_FILE_INST
readonly ENV_FILE_INST="${INSTALLER_ROOTPATH}/env.sh"; export ENV_FILE_INST

readonly DIR_DOCKER_INST="${INSTALLER_ROOTPATH}/docker"; export DIR_DOCKER_INST
readonly DIR_LIBVIRT_INST="${INSTALLER_ROOTPATH}/libvirt"; export DIR_LIBVIRT_INST
readonly DIR_CERTIFICATES_INST="${INSTALLER_ROOTPATH}/certificates"; export DIR_CERTIFICATES_INST
readonly DIR_SSL_TEMPLATES_INST="${DIR_CERTIFICATES_INST}/templates"; export DIR_SSL_TEMPLATES_INST

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
readonly PKI_ROOTPATH='/etc/pki'; export PKI_ROOTPATH

readonly SETTINGS_FILE="${STACK_ROOTPATH}/settings.yaml"; export SETTINGS_FILE
readonly ENV_FILE="${STACK_ROOTPATH}/env.sh"; export ENV_FILE

readonly DIR_DOCKER_HOST="${STACK_ROOTPATH}/docker"
readonly DIR_DOCKER_HOST_CHERRY_PROXY="${DIR_DOCKER_HOST}/cherry-proxy"; export DIR_DOCKER_HOST_CHERRY_PROXY
readonly DIR_DOCKER_HOST_CHERRY_DB="${DIR_DOCKER_HOST}/cherry-db"; export DIR_DOCKER_HOST_CHERRY_DB
readonly DIR_DOCKER_HOST_CHERRY_DB_DATABASE="${DIR_DOCKER_HOST_CHERRY_DB}/db"; export DIR_DOCKER_HOST_CHERRY_DB_DATABASE
readonly DIR_DOCKER_HOST_CHERRY_GUACAMOLE="${DIR_DOCKER_HOST}/cherry-guacamole"; export DIR_DOCKER_HOST_CHERRY_GUACAMOLE
readonly DIR_DOCKER_HOST_CHERRY_GUACD="${DIR_DOCKER_HOST}/cherry-guacd"; export DIR_DOCKER_HOST_CHERRY_GUACD
readonly DIR_DOCKER_HOST_CHERRY_API="${DIR_DOCKER_HOST}/cherry-api"; export DIR_DOCKER_HOST_CHERRY_API
readonly DIR_DOCKER_HOST_CHERRY_ADMIN_PANEL="${DIR_DOCKER_HOST}/cherry-admin-panel"; export DIR_DOCKER_HOST_CHERRY_ADMIN_PANEL

readonly DIR_DOCKER_HOST_INITDB="${DIR_DOCKER_HOST}/initdb"; export DIR_DOCKER_HOST_INITDB

readonly CONTAINER_DIRECTORIES_HOST=(
    "$DIR_DOCKER_HOST_CHERRY_PROXY"
    "$DIR_DOCKER_HOST_CHERRY_DB"
    "$DIR_DOCKER_HOST_CHERRY_GUACAMOLE"
    "$DIR_DOCKER_HOST_CHERRY_GUACD"
    "$DIR_DOCKER_HOST_CHERRY_API"
    "$DIR_DOCKER_HOST_CHERRY_ADMIN_PANEL"
); export CONTAINER_DIRECTORIES_HOST

readonly DIR_LIBVIRT_HOST="${STACK_ROOTPATH}/libvirt"; export DIR_LIBVIRT_HOST
readonly DIR_IMAGE_FILES="${STACK_ROOTPATH}/image-files"; export DIR_IMAGE_FILES
readonly DIR_VM_INSTANCES="${TEMP_ROOTPATH}/virtual-machines"; export DIR_VM_INSTANCES

readonly LIBVIRTD_CONFIG_FILE='/etc/libvirt/libvirtd.conf'; export LIBVIRTD_CONFIG_FILE
readonly LIBVIRTD_SYSCONFIG_FILE='/etc/sysconfig/libvirtd'; export LIBVIRTD_SYSCONFIG_FILE
readonly LIBVIRTD_SYSTEMD_OVERRIDE_FILE='/etc/systemd/system/libvirtd-tls.socket.d/override.conf'; export LIBVIRTD_SYSTEMD_OVERRIDE_FILE

readonly PKI_CA="${PKI_ROOTPATH}/CA"; export PKI_CA
readonly PKI_CA_PRIVATE="${PKI_CA}/private"; export PKI_CA_PRIVATE
readonly PKI_CA_SYSTEM_TRUST="${PKI_ROOTPATH}/trust/anchors"; export PKI_CA_SYSTEM_TRUST

readonly PKI_LIBVIRT="${PKI_ROOTPATH}/libvirt"; export PKI_LIBVIRT
readonly PKI_LIBVIRT_PRIVATE="${PKI_LIBVIRT}/private"; export PKI_LIBVIRT_PRIVATE

readonly PKI_CHERRY_API="${PKI_ROOTPATH}/cherry-api"; export PKI_CHERRY_API
readonly PKI_CHERRY_API_PRIVATE="${PKI_CHERRY_API}/private"; export PKI_CHERRY_API_PRIVATE

readonly DIR_POLKIT_ACTIONS='/usr/share/polkit-1/actions'; export DIR_POLKIT_ACTIONS
readonly DIR_POLKIT_RULES='/etc/polkit-1/rules.d'; export DIR_POLKIT_RULES

###############################
#           locks
###############################
readonly DIR_LOCK="${TEMP_ROOTPATH}/locks"; export DIR_LOCK

# Locks the existence of the Cherry VM Studio stack - created during the installation. Is present on the system regardless of the systemd services status.
readonly CVMS_STACK_LOCK="${DIR_LOCK}/cherry-vm-studio.lock"; export CVMS_STACK_LOCK

# Signifies that systemd cherry-vm-studio service (the stack) is running.
readonly CVMS_SERVICE_LOCK="${DIR_LOCK}/cherry-vm-studio.service.lock"; export CVMS_SERVICE_LOCK

###############################
#     systemd services
###############################
readonly DIR_SYSTEMD_SERVICES='/etc/systemd/system'; export DIR_SYSTEMD_SERVICES

readonly DIR_CVMS_SYSTEMD_SCRIPTS="${STACK_ROOTPATH}/systemd"; export DIR_CVMS_SYSTEMD_SCRIPTS

###############################
#     logger constants
###############################
readonly CVMS_SERVICE_LOG_TAG='cherry-vm-studio'; export CVMS_SERVICE_LOG_TAG
readonly CONTAINERS_SERVICE_LOG_TAG='cherry-containers'; export CONTAINERS_SERVICE_LOG_TAG

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
#virtual network infrastructure
###############################
# Networks
readonly NETWORK_RAS_NAME='cherry-ras-network'; export NETWORK_RAS_NAME
readonly NETWORK_RAS_RANGE=10; export NETWORK_RAS_RANGE
readonly NETWORK_RAS_NETMASK=28; export NETWORK_RAS_NETMASK

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
readonly SUFFIX_VETH_LIBVIRT_RASBUS=254; export SUFFIX_VETH_LIBVIRT_RASBUS

# VETH pairs
# veth pair for Cherry-API - rasBus
readonly VETH_API_RASBUS='api-rasBus'; export VETH_API_RASBUS
readonly VETH_RASBUS_API='rasBus-api'; export VETH_RASBUS_API

#veth pair for Guacamole-Guacd - rasBus
readonly VETH_GUACD_RASBUS='guacd-rasBus'; export VETH_GUACD_RASBUS
readonly VETH_RASBUS_GUACD='rasBus-guacd'; export VETH_RASBUS_GUACD

#veth pair for vmBr - rasBus
#vmBr is a bridge connecting all of the VM guests to the rest of the remote access infrastructure as well as the Internet
readonly VETH_VMBR_RASBUS='vmBr-rasBus'; export VETH_VMBR_RASBUS
readonly VETH_RASBUS_VMBR='rasBus-vmBr'; export VETH_RASBUS_VMBR

#veth pair for ext - rasBus
#ext veth end acts as an endpoint allowing Internet access for the guest VMs
readonly VETH_EXT_RASBUS='ext-rasBus'; export VETH_EXT_RASBUS
readonly VETH_RASBUS_EXT='rasBus-ext'; export VETH_RASBUS_EXT

#dedicated link for TLS socket communication with libvirt daemon
readonly VETH_LIBVIRT_RASBUS='libvirt-rasBus'; export VETH_LIBVIRT_RASBUS
readonly VETH_RASBUS_LIBVIRT='rasBus-libvirt'; export VETH_RASBUS_LIBVIRT

# Network namespaces
#network namespace name for the Cherry Remote Access Services Bus
readonly NS_RASBUS='cherry-rasBus'; export NS_RASBUS

# Network bridges
#bridge that connects all of the VM guests to the rest of the remote access infrastructure as well as the Internet
readonly BR_VMBR='cherry-vmBr'; export BR_VMBR

#bridge inside the NS_RASBUS namespace that connects Cherry-API, Guacamole Guacd containers
readonly BR_RASBR='cherry-rasBr'; export BR_RASBR

# Define the array of variable pairs - leverage the usage of indirect variable expansion -> use names of the variables instead of their direct expansion
readonly VETH_PAIRS=(
    "VETH_API_RASBUS VETH_RASBUS_API"
    "VETH_GUACD_RASBUS VETH_RASBUS_GUACD"
    "VETH_VMBR_RASBUS VETH_RASBUS_VMBR"
    "VETH_EXT_RASBUS VETH_RASBUS_EXT"
); export VETH_PAIRS

# "VETH_LIBVIRT_RASBUS VETH_RASBUS_LIBVIRT"

###############################
#       system worker
###############################
readonly SYSTEM_WORKER_USERNAME='CherryWorker'; export SYSTEM_WORKER_USERNAME

###############################
#    watched containers
###############################
readonly WATCHED_CONTAINERS=(
    "$CONTAINER_API"
    "$CONTAINER_GUACD"
); export WATCHED_CONTAINERS

###############################
#    guacamole db user
###############################
readonly POSTGRESQL_DATABASE='guacamole'; export POSTGRESQL_DATABASE
readonly POSTGRESQL_USER='guacadmin'; export POSTGRESQL_USER
readonly POSTGRESQL_PASSWORD='guacadmin'; export POSTGRESQL_PASSWORD
