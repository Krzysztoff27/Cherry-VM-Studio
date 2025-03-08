#!/usr/bin/env bash

###############################
#  Cleanup inside ns_rasbus
###############################
cleanup_ns_rasbus(){
    #Set all of the devices inside the NS_RASBUS namespace down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_API} down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_GUACD} down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_EXT} down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_LIBVIRT} down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_VMBR} down
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${BR_RASBR} down
}

###############################
#     Cleanup on host OS
###############################
cleanup_host_os(){
    #Set all of the devices inside the host network namespace down
    runuser -u CherryWorker -- sudo ip link set dev ${BR_VMBR} down

    #Delete all of the devices inside the NS_RASBUS namespace - attached ends of the VETH pairs
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_API}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_GUACD}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_EXT}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_LIBVIRT}
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_VMBR}
    #Bridge inside NS_RASBUS
    runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${BR_RASBR}

    #Delete all of the devices inside the host network namespace
    runuser -u CherryWorker -- sudo ip link del dev ${BR_VMBR}

    #Delete NS_RASBUS network namespace
    runuser -u CherryWorker -- sudo ip netns del ${NS_RASBUS}
}

###############################
# Detachement of Docker 
# container ns namespaces
###############################
remove_docker_namespaces(){
    #Delete NS_RASBUS and Docker containers network namespaces
    #Needs to be executed before diabling them - container PID needed for ns removal
    runuser -u CherryWorker -- sudo ip netns del ${CONTAINER_API}
    runuser -u CherryWorker -- sudo ip netns del ${CONTAINER_GUACD}
}

