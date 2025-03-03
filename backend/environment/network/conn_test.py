#!/usr/bin/env python

import libvirt

uri = 'qemu+tls://10.10.10.254/system'
try:
    conn = libvirt.open(uri)
    print(f"Successfully connected to {uri}")
    conn.close()

except libvirt.libvirtError as e:
    print(f"Failed to connect to libvirt: {e}")