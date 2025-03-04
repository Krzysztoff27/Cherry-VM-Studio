#!/usr/bin/env bash

###############################
# Docker containers namespaces
###############################
attach_docker_namespaces(){
    #create symlinks for Docker containers namespaces in order to control them from the host networking stack
    PID_API=$(runuser -u CherryWorker -- docker inspect -f '{{.State.Pid}}' ${CONTAINER_API})
    PID_GUACD=$(runuser -u CherryWorker -- docker inspect -f '{{.State.Pid}}' ${CONTAINER_GUACD})

    runuser -u CherryWorker -- sudo mkdir -p /var/run/netns #directory for symlinks, non-existant by default

    runuser -u CherryWorker -- sudo ln -sf /proc/${PID_API}/ns/net "/var/run/netns/${CONTAINER_API}" 
    runuser -u CherryWorker -- sudo ln -sf /proc/${PID_GUACD}/ns/net "/var/run/netns/${CONTAINER_GUACD}" 
}

###############################
#     NS_RASBUS namespace
###############################
create_ns_rasbus(){
    #create NS_RASBUS network namespace
    runuser -u CherryWorker -- sudo ip netns add ${NS_RASBUS}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev lo up #set lo interface up in order to bind the ns to the process

}

create_veth_pairs(){
    # Create the veth pairs, move one of their ends to the NS_RASBUS and bring them up
    for pair in "${VETH_PAIRS[@]}"; do
        read -r veth1 veth2 <<< "$pair"
        runuser -u CherryWorker -- sudo ip link add "${!veth1}" type veth peer name "${!veth2}"
        runuser -u CherryWorker -- sudo ip link set dev "${!veth1}" up
        runuser -u CherryWorker -- sudo ip link set "${!veth2}" netns "${NS_RASBUS}"
        runuser -u CherryWorker -- sudo ip netns exec "${NS_RASBUS}" ip link set dev "${!veth2}" up
    done
}

create_bridge_rasbr(){
    #network bridge for inter cherry-rasBus communication - bridges containers and cherry-vmBr
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link add ${BR_RASBR} type bridge
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${BR_RASBR} up
}

attach_docker_containers(){
    #attach API and Guacd containers to the NS_RASBUS namespace through a previously created VETH pairs
    runuser -u CherryWorker -- sudo ip link set ${VETH_API_RASBUS} netns ${CONTAINER_API}
    runuser -u CherryWorker -- sudo ip netns exec ${CONTAINER_API} ip link set dev ${VETH_API_RASBUS} up
    runuser -u CherryWorker -- sudo ip link set ${VETH_GUACD_RASBUS} netns ${CONTAINER_GUACD}
    runuser -u CherryWorker -- sudo ip netns exec ${CONTAINER_GUACD} ip link set dev ${VETH_GUACD_RASBUS} up
}

attach_veths_rasbus(){
    #attach VETHs inside the NS_RASBUS namespace to the BR_RASBR bridge
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_API} master ${BR_RASBR}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_GUACD} master ${BR_RASBR}
    #VETH pair for VM guests external connectivity
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_EXT} master ${BR_RASBR}
    #VETH pair for Cherry-API - libvirt daemon communication
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_LIBVIRT} master ${BR_RASBR}
}

###############################
#   Host network namespace
###############################
create_bridge_vm(){
    #network bridge for libvirt VM guests - Internet access
    runuser -u CherryWorker -- sudo ip link add ${BR_VMBR} type bridge
    runuser -u CherryWorker -- sudo ip link set dev ${BR_VMBR} up

    #attach VETH_VMBR_RASBUS end to the BR_VMBR on the host network namespace
    runuser -u CherryWorker -- sudo ip link set dev ${VETH_VMBR_RASBUS} master ${BR_VMBR}
}

###############################
#        IP addresses
###############################
address_ns_host(){
    #external connectivity VETH end on the host namespace
    runuser -u CherryWorker -- sudo ip addr add "10.10.10.1/24" dev ${VETH_EXT_RASBUS}
    #dedicated link for Cherry-API - libvirt daemon TLS socket (listens on 10.10.10.254:16514)
    runuser -u CherryWorker -- sudo ip addr add "10.10.10.254/24" dev ${VETH_LIBVIRT_RASBUS}
}
address_ns_rasbus(){
   #BR_RASBR inside the NS_RASBUS namespace
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip addr add "${SUBNET_RASBUS}.2/${MASK_RASBUS}" dev ${BR_RASBR} 
}
address_docker_containers(){
    #VETH ends inside Docker containers
    runuser -u CherryWorker -- sudo ip netns exec ${CONTAINER_API} ip addr add "${SUBNET_RASBUS}.3/${MASK_RASBUS}" dev ${VETH_API_RASBUS}
    runuser -u CherryWorker -- sudo ip netns exec ${CONTAINER_GUACD} ip addr add "${SUBNET_RASBUS}.4/${MASK_RASBUS}" dev ${VETH_GUACD_RASBUS}
}
