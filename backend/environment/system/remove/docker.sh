#!/usr/bin/env bash

remove_docker_networks(){
    printf '\n[i] Removing cvmm-internal network from docker firewall zone: '
    runuser -u CherryWorker -- sudo firewall-cmd --remove-interface=cvmm-internal --zone=docker >> "$LOGS_FILE"
    ok_handler
    printf '\n[i] Removing cvmm-internal Docker network: '
    runuser -u CherryWorker -- docker network rm cvmm-internal >> "$LOGS_FILE"
    ok_handler
}

configure_container_guacamole(){
    printf '\n[i] Stopping apache-guacamole docker stack: '
    runuser -u CherryWorker -- docker-compose -f "$DIR_DOCKER/apache-guacamole/docker-compose.yaml" down >> "$LOGS_FILE"
    ok_handler
    #Add removal of db directory and other associated files
}

configure_container_traefik(){
    printf '\n[i] Stopping traefik docker container: '
    runuser -u CherryWorker -- docker-compose -f "$DIR_DOCKER/traefik/docker-compose.yaml" down >> "$LOGS_FILE"
    ok_handler
    #Add removal of db directory and other associated files
}

configure_container_cherry-api(){
    printf '\n[i] Stopping Cherry API container: '
    runuser -u CherryWorker -- docker-compose -f "$DIR_DOCKER/cherry-api/docker-compose.yaml" down >> "$LOGS_FILE"
    ok_handler
}

configure_container_cherry-admin-panel(){
    printf '\n[i] Stopping Cherry Admin Panel container: '
    runuser -u CherryWorker -- docker-compose -f "$DIR_DOCKER/cherry-admin-panel/docker-compose.yaml" down >> "$LOGS_FILE"
    ok_handler
}