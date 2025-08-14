#!/usr/bin/env bash
###############################
#       env variables
###############################
readonly STACK_ROOTPATH='/opt/cherry-vm-studio'
readonly ENV_FILE="${STACK_ROOTPATH}/env.sh"

set -uo pipefail
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
    log error "Failed to seamlessly stop ${TARGET_CONTAINER}!"
}
trap error_handler ERR

###############################
#     Docker containers
###############################
stop_container_cherry_proxy(){
    log_runner 'Cherry-Proxy:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_PROXY}/docker-compose.yaml" down
    log info 'Stopped Cherry-Proxy container.'
}

stop_container_cherry_db(){
    log_runner 'Cherry-DB:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_DB}/docker-compose.yaml" down
    log info 'Stopped Cherry-DB container.'
}

stop_container_cherry_guacamole(){
    log_runner 'Cherry-Guacamole:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_GUACAMOLE}/docker-compose.yaml" down
    log info 'Stopped Cherry-Guacamole container.'
}

stop_container_cherry_guacd(){
    log info 'Removing Cherry-Guacd network namespace.'
    log_runner 'Cherry-Guacd:' ip netns del "$CONTAINER_GUACD"
    log info 'Removed Cherry-Guacd network namespace.'
    log_runner 'Cherry-Guacamole:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_GUACD}/docker-compose.yaml" down
    log info 'Stopped Cherry-Guacd container.'
}

stop_container_cherry_api(){
    log info 'Removing Cherry-API network namespace.'
    log_runner 'Cherry-API:' ip netns del "$CONTAINER_API"
    log info 'Removed Cherry-API network namespace.'
    log_runner 'Cherry-API:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_API}/docker-compose.yaml" down
    log info 'Stopped Cherry-API container.'
}

stop_container_cherry_admin_panel(){
    log_runner 'Cherry-Admin-Panel:' docker-compose -f "${DIR_DOCKER_HOST_CHERRY_ADMIN_PANEL}/docker-compose.yaml" down
    log info 'Stopped Cherry-Admin-Panel container.'
}

stop_all_containers(){
    stop_container_cherry_proxy
    stop_container_cherry_db
    stop_container_cherry_guacamole
    stop_container_cherry_guacd
    stop_container_cherry_api
    stop_container_cherry_admin_panel
}

stop_docker_container(){
    local container_name=$1
    log info "Attempting to stop container: ${container_name}"

    case "$container_name" in
        'panel')
        stop_container_cherry_admin_panel
        ;;
        'api')
        stop_container_cherry_api
        ;;
        'db')
        stop_container_cherry_db
        ;;
        'proxy')
        stop_container_cherry_proxy
        ;;
        'guacamole')
        stop_container_cherry_guacamole
        ;;
        'guacd')
        stop_container_cherry_guacd
        ;;
        'all')
        stop_all_containers
        ;;
        *)
        log error 'Attempted to stop unrecognized container.'
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

if [ ! -f "$ENV_FILE" ]; then
    log error 'env.sh file not found. Check files integrity and try again.'
    exit 1
else
    log_runner 'Sourcing environmental variables:' source "$ENV_FILE"
fi

TARGET_CONTAINER=$1

log_runner "Attempting to stop ${TARGET_CONTAINER}:" stop_container "$TARGET_CONTAINER"