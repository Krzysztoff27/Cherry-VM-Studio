#!/usr/bin/env bash

generate_tls_certificates(){
    printf '[i] Creating directory for the host PKI keys and certificates: '
    runuser -u CherryWorker -- mkdir -p "${DIR_CVMM_OPT}pki/{CA,server,templates}"
    ok_handler
    printf '[i] Modifying server certificate template: '
    server_template='./templates/s1_server_template.info'
    hostname=$(cat /proc/sys/kernel/hostname)
    sed -i "s/^cn[[:space:]]*=[[:space:]]*$/cn = $hostname/" "$server_template"
    sed -i "s/^dns_name[[:space:]]*=[[:space:]]*$/dns_name = $hostname/" "$server_template"
    ok_handler
    printf '[i] Copying certificate templates: '
    runuser -u CherryWorker -- cp ../../network/certificates/templates/* "${DIR_CVMM_OPT}pki/templates"
    ok_handler
    #Certificate Authority - PK and certificate
    printf '[i] Generating Certificate Authority PK: '
    runuser -u CherryWorker -- sudo certtool --generate-privkey > certificate_authority_key.pem
    runuser -u CherryWorker -- sudo chmod 400 certificate_authority_key.pem
    ok_handler
    printf '[i] Generating Certificate Authority certificate: '
    runuser -u CherryWorker -- sudo certtool --generate-self-signed \
                                    --template ./templates/certificate_authority.info \
                                    --load-privkey certificate_authority_key.pem \
                                    --outfile certificate_authority_certificate.pem

    runuser -u CherryWorker -- sudo chmod 644 certificate_authority_certificate.pem
    ok_handler
    #Server - PK and certificate
    printf '[i] Generating Server PK: '
    runuser -u CherryWorker -- sudo certtool --generate-privkey > s1_server_key.pem
    runuser -u CherryWorker -- sudo chmod 400 s1_server_key.pem
    ok_handler
    printf '[i] Generating Server certificate: '
    runuser -u CherryWorker -- sudo certtool --generate-certificate \
                                    --template ./templates/s1_server_template.info \
                                    --load-privkey s1_server_key.pem \
                                    --load-ca-certificate certificate_authority_certificate.pem \
                                    --load-ca-privkey certificate_authority_key.pem \
                                    --outfile s1_server_certificate.pem

    runuser -u CherryWorker -- sudo chmod 644 s1_server_certificate.pem
    ok_handler
    #Client - PK and certificate
    printf '[i] Generating Client (Cherry-API) PK: '
    runuser -u CherryWorker -- certtool --generate-privkey > cherry-api_client_key.pem
    runuser -u CherryWorker -- sudo chmod 400 cherry-api_client_key.pem
    ok_handler
    printf '[i] Generating Client (Cherry-API) certificate: '
    runuser -u CherryWorker -- sudo certtool --generate-certificate \
                                    --template ./templates/cherry-api_client_template.info \
                                    --load-privkey cherry-api_client_key.pem \
                                    --load-ca-certificate certificate_authority_certificate.pem \
                                    --load-ca-privkey certificate_authority_key.pem \
                                    --outfile cherry-api_client_certificate.pem

    runuser -u CherryWorker -- sudo chmod 644 cherry-api_client_certificate.pem
    ok_handler
    #Copying and moving files to their places
    printf '[i] Moving Certificate Authority PK: '
    runuser -u CherryWorker -- mv certificate_authority_key.pem "${DIR_CVMM_OPT}pki/CA"
    ok_handler
    printf '[i] Moving CA certificate to the Cherry-API container: '
    runuser -u CherryWorker -- docker exec -it cherry-api mkdir -p /etc/pki/CA
    runuser -u CherryWorker -- sudo docker cp certificate_authority_certificate.pem cherry-api:/etc/pki/CA/cacert.pem
    ok_handler
    printf '[i] Moving CA certificate to the host OS: '
    runuser -u CherryWorker -- sudo mkdir -p /etc/pki/CA
    runuser -u CherryWorker -- sudo cp certificate_authority_certificate.pem /etc/pki/CA/cacert.pem
    runuser -u CherryWorker -- sudo chmod 644 /etc/pki/CA/cacert.pem
    ok_handler
    printf '[i] Moving Server PK and certificate: '
    runuser -u CherryWorker -- sudo mkdir -p /etc/pki/libvirt/private
    runuser -u CherryWorker -- sudo cp s1_server_certificate.pem /etc/pki/libvirt/servercert.pem
    runuser -u CherryWorker -- sudo cp s1_server_key.pem /etc/pki/libvirt/private/serverkey.pem
    ok_handler
    printf '[i] Moving Client (Cherry-API) PK and certificate: '
    runuser -u CherryWorker -- docker exec -it cherry-api mkdir -p /etc/pki/libvirt/private
    runuser -u CherryWorker -- sudo docker cp cherry-api_client_key.pem cherry-api:/etc/pki/libvirt/private/clientkey.pem
    runuser -u CherryWorker -- sudo docker cp cherry-api_client_certificate.pem cherry-api:/etc/pki/libvirt/clientcert.pem
    ok_handler
}

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