#!/usr/bin/env bash

create_vm_networks(){
    printf '\n[i] Creating a default NAT network for VMs and making it persistent: '
    runuser -u CherryWorker -- virsh net-define --file "${DIR_LIBVIRT}networks/isolated-nat.xml" > "$LOGS_FILE"
    runuser -u CherryWorker -- virsh net-start --network isolated-nat > "$LOGS_FILE"
    runuser -u CherryWorker -- virsh net-autostart --network isolated-nat > "$LOGS_FILE"
    ok_handler 
}

create_vm_firewall(){
    printf '\n[i] Creating network filter to restrict communication between VMs on a shared NAT network: '
    runuser -u CherryWorker -- virsh nwfilter-define --file "${DIR_LIBVIRT}filters/isolated-nat-filter.xml" > "$LOGS_FILE"
    ok_handler
}