#!/usr/bin/env bash
docker exec -it cherry-api mkdir -p /etc/pki/CA
docker cp ./certificates/certificate_authority_certificate.pem cherry-api:/etc/pki/CA/cacert.pem
docker exec -it cherry-api mkdir -p /etc/pki/libvirt/private
docker cp ./certificates/cherry-api_client_key.pem cherry-api:/etc/pki/libvirt/private/clientkey.pem
docker cp ./certificates/cherry-api_client_certificate.pem cherry-api:/etc/pki/libvirt/clientcert.pem