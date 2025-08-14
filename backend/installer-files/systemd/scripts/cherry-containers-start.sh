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
    logger -t "$CONTAINERS_SERVICE_LOG_TAG" -p "user.${priority}" "$@"
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
    log error "Failed to start ${TARGET_CONTAINER}!"
    log_runner 'Performing cleanup:' /usr/bin/pkexec --disable-internal-agent "${DIR_CVMS_SYSTEMD_SCRIPTS}/cherry-containers-stop.sh" "${TARGET_CONTAINER}"
    exit 1
}
trap error_handler ERR

###############################
#     Docker containers
###############################
start_container_cherry_proxy(){
    log_runner 'Cherry-Proxy:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_PROXY}/docker-compose.yaml" up -d
    log info 'Started Cherry-Proxy container.'
}

start_container_cherry_db(){
    log_runner 'Cherry-DB:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_DB}/docker-compose.yaml" up -d
    log info 'Started Cherry-DB container.'
}

start_container_cherry_guacamole(){
    log_runner 'Cherry-Guacamole:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_GUACAMOLE}/docker-compose.yaml" up -d
    log info 'Started Cherry-Guacamole container.'
}

start_container_cherry_guacd(){
    log_runner 'Cherry-Guacd:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_GUACD}/docker-compose.yaml" up -d
    log info 'Started Cherry-Guacd container.'

    sleep 2
    PID_GUACD=$(docker inspect -f '{{.State.Pid}}' "${CONTAINER_GUACD}")
    log_runner 'Cherry-Guacd:' ln -sf /proc/"${PID_GUACD}"/ns/net "/var/run/netns/${CONTAINER_GUACD}" 
    log info 'Created netns symlink for Cherry-Guacd container.'

    log info 'Attaching Cherry-Guacd container to NS_RASBUS namespace.'
    log_runner 'Cherry-Guacd:' ip link set "${VETH_GUACD_RASBUS}" netns "${CONTAINER_GUACD}"
    log_runner 'Cherry-Guacd:' ip netns exec "${CONTAINER_GUACD}" ip link set dev "${VETH_GUACD_RASBUS}" up
    log info 'Cherry-Guacd container attached to NS_RASBUS namespace.'
    log info 'Addressing Cherry-Guacd NS_RASBUS connector.'
    log_runner 'Cherry-Guacd:' ip netns exec "${CONTAINER_GUACD}" ip addr add "${NETWORK_RAS%.*}.${SUFFIX_VETH_GUACD_RASBUS}/${NETWORK_RAS_NETMASK}" dev "${VETH_GUACD_RASBUS}"
}

start_container_cherry_api(){
    log_runner 'Cherry-API:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_API}/docker-compose.yaml" up -d
    log info 'Started Cherry-API container.'
    sleep 2

    PID_API=$(docker inspect -f '{{.State.Pid}}' "${CONTAINER_API}")
    log_runner 'Cherry-API:' ln -sf /proc/"${PID_API}"/ns/net "/var/run/netns/${CONTAINER_API}" 
    log info 'Created netns symlink for Cherry-API container.'

    log info 'Attaching Cherry-API container to NS_RASBUS namespace.'
    log_runner 'Cherry-API:' ip link set "${VETH_API_RASBUS}" netns "${CONTAINER_API}"
    log_runner 'Cherry-API:' ip netns exec "${CONTAINER_API}" ip link set dev "${VETH_API_RASBUS}" up
    log info 'Cherry-API container attached to NS_RASBUS namespace.'
    log info 'Addressing Cherry-API NS_RASBUS connector.'
    log_runner 'Cherry-API:' ip netns exec "${CONTAINER_API}" ip addr add "${NETWORK_RAS%.*}.${SUFFIX_VETH_LIBVIRT_API_RASBUS}/${NETWORK_RAS_NETMASK}" dev "${VETH_API_RASBUS}"
}

start_container_cherry_admin_panel(){
    log_runner 'Cherry-Admin-Panel:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_ADMIN_PANEL}/docker-compose.yaml" up -d
    log info 'Started Cherry-Admin-Panel container.'
}

start_all_containers(){
    start_container_cherry_proxy
    start_container_cherry_db
    start_container_cherry_guacamole
    start_container_cherry_guacd
    start_container_cherry_api
    start_container_cherry_admin_panel
}

start_docker_container(){
    local container_name=$1
    log info "Attempting to start container: ${container_name}"

    case "$container_name" in
        'panel')
        start_container_cherry_admin_panel
        ;;
        'api')
        start_container_cherry_api
        ;;
        'db')
        start_container_cherry_db
        ;;
        'proxy')
        start_container_cherry_proxy
        ;;
        'guacamole')
        start_container_cherry_guacamole
        ;;
        'guacd')
        start_container_cherry_guacd
        ;;
        'all')
        start_all_containers
        ;;
        *)
        log error 'Attempted to start unrecognized container.'
        exit 1
        ;;
    esac
}

###############################
#     sourcing settings
###############################
if [ -z "${PKEXEC_UID:-}" ]; then
    log error 'This script must be run via pkexec with action com.cvms.containers.\n'
    exit 1
fi

if [[ ! -f "$CVMS_STACK_LOCK" ]]; then
    log error 'Cannot use systemctl cherry-vm-studio without having installed Cherry VM Studio first!'
    exit 1
fi

if [[ ! -f "$CVMS_SERVICE_LOCK" ]]; then
    log error 'Cannot use systemctl cherry-containers without having started Cherry VM Studio first!'
    exit 1
fi

if [ ! -r "$SETTINGS_FILE" ]; then
    log error 'Cannot read settings.yaml file.'
    exit 1
else   
    log_runner 'Reading NETWORK_RAS settings:' NETWORK_RAS="$(yq eval ".networks.${NETWORK_RAS_NAME}.network" "$SETTINGS_FILE")"
fi

if [ ! -r "$ENV_FILE" ]; then
    log error 'env.sh file not found. Check files integrity and try again.'
    exit 1
else
    log_runner 'Sourcing environmental variables:' source "$ENV_FILE"
fi

TARGET_CONTAINER=$1

log_runner "Attempting to start ${TARGET_CONTAINER}:" start_container "$TARGET_CONTAINER"

