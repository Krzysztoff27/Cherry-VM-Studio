#!/usr/bin/env bash
###############################
#       env variables
###############################
STACK_ROOTPATH='/opt/cherry-vm-studio'
ENV_FILE="${STACK_ROOTPATH}/env.sh"

set -uo pipefail
###############################
#       logging logic
###############################
# Logger logic - wrapper for prefix addition and output redirects
log(){
    local priority=$1
    shift
    logger -t "$CVMS_SERVICE_LOG_TAG" -p "user.${priority}" "$@"
}

log_prefix() {
    local priority="$1"
    local prefix="$2"
    shift 2
    while IFS= read -r line || [[ -n "$line" ]]; do
        log "$priority" "${prefix}: ${line}"
    done
}

log_runner(){
    local prefix="$1"
    shift
    {
        "$@" 2> >(log_prefix error "${prefix}" ) | log_prefix info "${prefix}"
    }
}

error_handler(){
    log error 'Failed to stop all elements of the Cherry VM Studio stack!'
}
trap error_handler ERR

###############################
#   network infrastructure
###############################
cleanup_ns_rasbus(){
    #Set all of the devices inside the NS_RASBUS namespace down
    log info 'Setting all of the devices inside NS_RASBUS network namespace down.'
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_API" down
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_GUACD" down
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_EXT" down
    #log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_LIBVIRT" down
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_VMBR" down
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$BR_RASBR" down
    log info 'Set all of the devices inside NS_RASBUS network namespace down.'
}

cleanup_host_os(){
    log info 'Setting all of the devices inside host network namespace down.'
    #Set all of the devices inside the host network namespace down
    log_runner 'BR_VMBR:' ip link set dev "$BR_VMBR" down

    #Delete all of the devices inside the NS_RASBUS namespace - attached ends of the VETH pairs
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_GUACD"
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_API"
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_EXT"
    #log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_LIBVIRT"
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_VMBR"
    #Bridge inside NS_RASBUS
    log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$BR_RASBR"

    #Delete all of the devices inside the host network namespace
    log_runner 'BR_VMBR:' ip link del dev "$BR_VMBR"

    #Delete NS_RASBUS network namespace
    log_runner 'NS_RASBUS:' ip netns del "$NS_RASBUS"

    log info 'Set all of the devices inside host network namespace down.'
}

###############################
#    system configuration
###############################
if [ -z "${PKEXEC_UID:-}" ]; then
    log error 'This script must be run via pkexec with action com.cvms.stack.\n'
    exit 1
fi

if [ ! -f "$CVMS_STACK_LOCK" ]; then
    log error 'Cannot use systemctl cherry-vm-studio without having installed Cherry VM Studio first!'
    exit 1
fi

# Check if the infrastructure is running
if [ ! -f "$CVMS_SERVICE_LOCK" ]; then
    log error 'Cherry VM Studio stack is not running.'
    exit 1
fi

if [ ! -r "$SETTINGS_FILE" ]; then
    log error 'Cannot read settings.yaml file.'
    exit 1
else   
    log_runner 'Reading NETWORK_RAS settings:' NETWORK_RAS="$(yq eval ".networks.${NETWORK_RAS_NAME}.network" "$SETTINGS_FILE")"
fi

if [ ! -f "$ENV_FILE" ]; then
    log error 'env.sh file not found in the installer files. Check files integrity and try again.'
    exit 1
else
    log_runner 'Sourcing environmental variables:' source "$ENV_FILE"
fi

log info 'Stopping Cherry VM Studio Stack...'

log_runner 'Stopping all containers.'  docker stack rm --compose-file "${DIR_DOCKER_HOST}/docker-compose.yaml"

cleanup_ns_rasbus
cleanup_host_os

log info 'Removing service lock.'
log_runner 'CVMS_SERVICE_LOCK' rm -f "$CVMS_SERVICE_LOCK"

log info 'Succesfully stopped Cherry VM Studio Stack.'
