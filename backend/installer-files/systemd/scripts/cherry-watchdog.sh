#!/usr/bin/env bash
###############################
#       env variables
###############################
readonly STACK_ROOTPATH='/opt/cherry-vm-studio'
readonly ENV_FILE="${STACK_ROOTPATH}/env.sh"

set -euo pipefail
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
    log error 'Failed to start Cherry VM Studio Watchdog!'
    exit 1
}
trap error_handler ERR

###############################
#    system logic
###############################
attach_container(){
    local container="$1"
    local veth_connector="$2"
    local ip_suffix="$3"

    PID=$(docker inspect -f '{{.State.Pid}}' "$container")
    log_runner "$container:" ln -sf /proc/"${PID}"/ns/net "/var/run/netns/${container}" 
    log info "Created netns symlink for $container"

    log info "Attaching $container to NS_RASBUS namespace."
    log_runner "$container:" ip link set "$veth_connector" netns "$container"
    log_runner "$container:" ip netns exec "$container" ip link set dev "$veth_connector" up

    log info "Addressing $container NS_RASBUS connector."
    log_runner "$container:" ip netns exec "$container" ip addr add "${NETWORK_RAS%.*}.${ip_suffix}/${NETWORK_RAS_NETMASK}" dev "$veth_connector"
}

start_container(){
    local container="$1"

    case "$container" in
        "$CONTAINER_API")
            attach_container "$CONTAINER_API" "$VETH_API_RASBUS" "$SUFFIX_VETH_API_RASBUS" ;;
        "$CONTAINER_GUACD")
            attach_container "$CONTAINER_API" "$VETH_GUACD_RASBUS" "$SUFFIX_VETH_GUACD_RASBUS" ;;
        *)
        log error "Attempting to initialize unrecognized container: $container."
        exit 1
    esac
}

stop_container(){
    local container="$1"

    case "$container" in
        "$CONTAINER_API")
            
        "$CONTAINER_GUACD")

        *)
        log error "Attempting to uninitialize unrecognized container: $container."
        exit 1
    esac
}

###############################
#    system configuration
###############################
if [ -z "${PKEXEC_UID:-}" ]; then
    log error 'This script must be run via pkexec with action com.cvms.watchdog.\n'
    exit 1
fi

if [ ! -f "$CVMS_STACK_LOCK" ]; then
    log error 'Cannot use systemctl cherry-vm-studio without having installed Cherry VM Studio first!'
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

log info 'Initializing Cherry VM Studio Watchdog...'

docker events --format '{{.Status}} {{.Actor.Attributes.name}}' \
              --filter 'type=container' \
              --filter 'event=start' \
              --filter 'event=die' |
while read -r status name; do
    if [[ " ${WATCHED_CONTAINERS[*]} " =~ " ${name} " ]]; then
        if [[ $status == "start" ]]; then
            log_runner "Container $name started." start_container "$name"
        elif [[ $status == "die" ]]; then
            log_runner "Container $name died." stop_container "$name"
        fi
    fi
done