#!/usr/bin/env bash

###############################
#      root rights check
###############################

#Test to ensure that script is executed with root priviliges
if ((EUID != 0)); then
    printf '[!] Insufficient priviliges! Please run the script with root rights.\n'
    exit
fi

###############################
#      utility functions
###############################

#set -e

###############################
#       env variables
###############################
source ../../env/infrastructure.env

###############################
#     deletion functions
###############################

#Set all of the devices inside the NS_RASBUS namespace down
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_API} down
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_GUACD} down
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_EXT} down
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${VETH_RASBUS_VMBR} down
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link set dev ${BR_RASBR} down

#Set all of the devices on the host network namespace down
runuser -u CherryWorker -- sudo ip link set dev ${BR_VMBR} down

#Delete all of the devices inside the NS_RASBUS namespace
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_API}
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_GUACD}
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_EXT}
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${VETH_RASBUS_VMBR}
runuser -u CherryWorker -- sudo ip netns exec ${NS_RASBUS} ip link del dev ${BR_RASBR}

#Delete all of the devices on the host network namespace
runuser -u CherryWorker -- sudo ip link del dev ${BR_VMBR}

#Delete NS_RASBUS and Docker containers network namespaces
runuser -u CherryWorker -- sudo ip netns del ${NS_RASBUS}
runuser -u CherryWorker -- sudo ip netns del ${CONTAINER_API}
runuser -u CherryWorker -- sudo ip netns del ${CONTAINER_GUACD}