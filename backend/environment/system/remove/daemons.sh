#!/usr/bin/env bash

configure_daemon_libvirt(){
    printf '\n[i] Disabling libvirt monolithic daemon from running on startup: '
    systemctl -q disable libvirtd.service
    ok_handler
    printf '[i] Stopping libvirt monolithic daemon: '
    systemctl -q stop libvirtd.service 
    ok_handler
    printf "[i] Removing directory structure ($DIR_LIBVIRT) and vm infrastructure .xml files: "
    rm --interactive=never -r -f "$DIR_LIBVIRT"
    ok_handler
}

configure_daemon_docker(){
    printf '\n[i] Disabling docker daemon from running on startup: '
    systemctl -q disable docker.service 
    ok_handler
    printf '[i] Stopping docker daemon: '
    systemctl -q stop docker.service 
    ok_handler
    printf "[i] Removing directory structure ($DIR_DOCKER) and docker files: "
    rm --interactive=never -r -f "$DIR_DOCKER"
    ok_handler
}

