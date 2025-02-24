#!/usr/bin/env bash

###############################
#      root rights check
###############################

#Test to ensure that script is executed with root priviliges
if ((EUID != 0)); then
    printf '{"error":"Insufficient priviliges! Please run the script with root rights."}\n'
    exit
fi

###############################
#       env variables
###############################

#URI for virsh operations performed on the system session of qemu by CherryWorker
readonly LIBVIRT_DEFAULT_URI='qemu:///system'

###############################
#      utility functions
###############################

#Display usage of script when executed without any flags
usage() {
    printf '{"error":"Usage: %s -i <machine id>"}\n' "$0"
    exit 1
}

#Flag handler to parse input arguments
while getopts ":i:" opt; do
    case $opt in
        i)
            MACHINE_ID=$OPTARG
            ;;
        \?)
            printf '{"error":"Invalid option: -%s"}\n' "$OPTARG" >&2
            usage
            ;;
        :)
            printf '{"error":"Option -%s requires an argument."}\n' "$OPTARG" >&2
            usage
            ;;
    esac
done

# Check if the -i flag was provided
if [ -z "$MACHINE_ID" ]; then
    printf '{"error":"The -i flag is mandatory."}\n'
    usage
fi

###############################
#       fetcher logic
###############################

