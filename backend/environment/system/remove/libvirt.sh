#!/usr/bin/env bash

remove_vm_networks(){
    printf '[i] Removing a default NAT network for VMs: '
    (virsh net-undefine --network isolated-nat >> "$LOGS_FILE" && virsh net-destroy --network isolated-nat  >> "$LOGS_FILE")
    ok_handler
}

remove_vm_firewall(){
    printf '\n[i] Removing network filter to restrict inter VM communication: '
    virsh nwfilter-undefine isolated-nat-filter >> "$LOGS_FILE"
    ok_handler
}
