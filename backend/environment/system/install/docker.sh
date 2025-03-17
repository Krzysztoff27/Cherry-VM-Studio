#!/usr/bin/env bash

create_docker_networks(){
    printf '\n[i] Creating cvmm-internal Docker network: '
    runuser -u CherryWorker -- docker network create -o "com.docker.network.bridge.enable_icc"="true" -o "com.docker.network.bridge.name"="cvmm-internal" --driver=bridge --subnet=172.16.100.0/24 --gateway=172.16.100.1 --internal cvmm-internal > "$LOGS_FILE"
    ok_handler
    printf '\n[i] Adding cvmm-internal Docker network to docker firewall zone: '
    runuser -u CherryWorker -- sudo firewall-cmd --add-interface=cvmm-internal --zone=docker --permanent > "$LOGS_FILE"
    runuser -u CherryWorker -- sudo firewall-cmd --reload > "$LOGS_FILE"
    ok_handler
}

configure_container_traefik(){
    printf '\n[i] Creating .env file for traefik docker container: '
    runuser -u CherryWorker -- printf "DOMAIN_NAME=%s\n" "$domain_name" > "${DIR_DOCKER}traefik/.env" 
    ok_handler
    printf '[i] Starting traefik docker container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}traefik/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_guacamole(){
    printf '\n[i] Creating initdb.sql SQL script for Apache Guacamole PostgreSQL db: '
    runuser -u CherryWorker -- docker run -q --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > "${DIR_DOCKER}apache-guacamole/initdb/01-initdb.sql"
    ok_handler
    printf '[i] Starting apache-guacamole docker stack: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}apache-guacamole/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_cherry-api(){
    printf '\n[i] Starting Cherry API container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}cherry-api/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

configure_container_cherry-admin-panel(){
    printf '[i] Starting Cherry Admin Panel container: '
    runuser -u CherryWorker -- docker-compose -f "${DIR_DOCKER}cherry-admin-panel/docker-compose.yaml" up -d > "$LOGS_FILE"
    ok_handler
}

