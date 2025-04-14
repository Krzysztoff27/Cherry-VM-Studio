#!/usr/bin/env bash

generate_uuid(){
    uuid=$(cat /proc/sys/kernel/random/uuid)
    uuid_first_segment=$(echo $uuid | cut -d'-' -f1)
}

modify_vm_template(){
    generate_uuid
    #filename=$(basename "$ENV_FILE"); filename=$(basename -s .env "$filename")
    filename=$(basename -s .env "$(basename "$ENV_FILE")")
    fullname="${filename}-${uuid_first_segment}"
    diskimage="/var/lib/libvirt/images/"$fullname".qcow2"
    echo "$filename"
    echo "$fullname"
    echo "$diskimage"
    #cp "$DISK_IMAGE_TEMPLATE" "$diskimage"
    #xsltproc --stringparam new-uuid "$uuid" --stringparam new-name "$fullname" --stringparam new-disk-source "$diskimage" \
    #opensuse-template-modify.xslt "/opt/libvirt/cherry-vm-manager/virtual-machines/opensuse-15.6-template.xml" > "/opt/libvirt/cherry-vm-manager/virtual-machines/"$fullname".xml"
}

create_vm_guest(){
    printf '\n[i] Creating virtual machine guest: '
    virsh define --file /opt/libvirt/cherry-vm-manager/virtual-machines/opensuse-leap-15.6.xml 
    printf 'OK\n'
    printf '\n[i] Starting virtual machine: '
    virsh start opensuse-leap-15.6
    printf 'OK\n'
    printf '\n[i] The VNC port for the machines is: '
    virsh vncdisplay opensuse-leap-15.6
}

###############################
#          creation
###############################

creation(){
    modify_vm_template
}
creation