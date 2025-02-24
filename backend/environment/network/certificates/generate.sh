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
#  Certificate Authority PK
###############################
runuser -u CherryWorker -- sudo certtool --generate-privkey > certificate_authority_key.pem
runuser -u CherryWorker -- sudo chmod 400 certificate_authority_key.pem

###############################
# Certificate Authority Cert
###############################
runuser -u CherryWorker -- sudo certtool --generate-self-signed \
                                    --template ./templates/certificate_authority.info \
                                    --load-privkey certificate_authority_key.pem \
                                    --outfile certificate_authority_certificate.pem

runuser -u CherryWorker -- sudo chmod 644 certificate_authority_certificate.pem

#Copy cert to the Cherry-API container
runuser -u CherryWorker -- docker cp certificate_authority_certificate.pem cherry-api:/usr/local/share/ca-certificates
runuser -u CherryWorker -- docker exec -it cherry-api update-ca-certificates

#Copy cert to the host system
runuser -u CherryWorker -- sudo mkdir -p /etc/pki/CA
runuser -u CherryWorker -- sudo cp certificate_authority_certificate.pem /etc/pki/CA/cacert.pem
runuser -u CherryWorker -- sudo chmod 644 /etc/pki/CA/cacert.pem
runuser -u CherryWorker -- sudo cp certificate_authority_certificate.pem /etc/pki/trust/anchors/cacert.pem
runuser -u CherryWorker -- sudo chmod 644 /etc/pki/trust/anchors/cacert.pem
runuser -u CherryWorker -- sudo update-ca-certificates

###############################
#         Server PK
###############################
runuser -u CherryWorker -- sudo certtool --generate-privkey > s1_server_key.pem
runuser -u CherryWorker -- sudo chmod 400 s1_server_key.pem

###############################
#         Server Cert
###############################
runuser -u CherryWorker -- sudo certtool --generate-certificate \
                                    --template ./templates/s1_server_template.info \
                                    --load-privkey s1_server_key.pem \
                                    --load-ca-certificate certificate_authority_certificate.pem \
                                    --load-ca-privkey certificate_authority_key.pem \
                                    --outfile s1_server_certificate.pem

runuser -u CherryWorker -- sudo chmod 644 s1_server_certificate.pem

#Create directories for the libvirt daemon to read the certs from and copy them
runuser -u CherryWorker -- sudo mkdir -p /etc/pki/libvirt/private
runuser -u CherryWorker -- sudo cp s1_server_certificate.pem /etc/pki/libvirt/servercert.pem
runuser -u CherryWorker -- sudo cp s1_server_key.pem /etc/pki/libvirt/private/serverkey.pem

###############################
#    Client (Cherry-API) PK
###############################
runuser -u CherryWorker -- certtool --generate-privkey > cherry-api_client_key.pem
runuser -u CherryWorker -- sudo chmod 400 cherry-api_client_key.pem

###############################
#   Client (Cherry-API) Cert
###############################
runuser -u CherryWorker -- sudo certtool --generate-certificate \
                                    --template ./templates/cherry-api_client_template.info \
                                    --load-privkey cherry-api_client_key.pem \
                                    --load-ca-certificate certificate_authority_certificate.pem \
                                    --load-ca-privkey certificate_authority_key.pem \
                                    --outfile cherry-api_client_certificate.pem
runuser -u CherryWorker -- sudo chmod 644 cherry-api_client_certificate.pem

runuser -u CherryWorker -- docker exec -it cherry-api mkdir -p /etc/pki/libvirt/private
runuser -u CherryWorker -- sudo docker cp cherry-api_client_key.pem cherry-api:/etc/pki/libvirt/private
runuser -u CherryWorker -- sudo docker cp cherry-api_client_certificate.pem cherry-api:/etc/pki/libvirt
