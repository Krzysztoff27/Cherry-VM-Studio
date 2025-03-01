#!/usr/bin/env python

import libvirt

uri = 'qemu+tls://10.10.10.254/system'

api_key = '/etc/pki/libvirt/private/cherry-api_client_key.pem'
api_cert = '/etc/pki/libvirt/cherry-api_client_certificate.pem'
ca_cert = '/usr/local/share/ca-certificates/certificate_authority_certificate.pem'

try:
    conn = libvirt.open(uri)
    print(f"Successfully connected to {uri}")
    conn.close()

except libvirt.libvirtError as e:
    print(f"Failed to connect to libvirt: {e}")