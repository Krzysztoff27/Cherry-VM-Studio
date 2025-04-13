#!/usr/bin/env bash

generate_uuid(){
    uuid=$(cat /proc/sys/kernel/random/uuid)
    uuid_first_segment=$(echo $uuid | cut -d'-' -f1)
}

modify_vm_template(){
    mkdir -p '/opt/cherry-vm-manager/libvirt/virtual-machines/tinycore-linux'
    generate_uuid
    iso='./disk-image/tinycore.iso'
    disk_image='./disk-image/tinycore.img'
    name='tinycore-linux-init'
    full_name="${uuid_first_segment}-${name}"
    group='desktop'
    group_member_id=999
    xsltproc --verbose --stringparam new-uuid "$uuid" \
    --stringparam new-name "$full_name" \
    --stringparam new-group "$group" \
    --stringparam new-group-member-id "$group_member_id" \
    tinycore-linux-modify.xslt \
    './tinycore-linux.xml' > \
    '/opt/cherry-vm-manager/libvirt/virtual-machines/tinycore-linux/tinycore-linux-init.xml'
}

create_vm_guest(){
    printf '\n[i] Creating virtual machine guest: '
    virsh create '/opt/cherry-vm-manager/libvirt/virtual-machines/tinycore-linux/tinycore-linux-init.xml'
    printf 'OK\n'
    printf '\n[i] Starting virtual machine: '
    virsh start "$name"
    printf 'OK\n'
    printf '\n[i] The VNC port for the machines is: '
    virsh vncdisplay "$name"
}

modify_vm_template
create_vm_guest