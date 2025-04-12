import libvirt
import logging
from typing import Literal

###############################
#   connection definition
###############################
class LibvirtConnection():
    hypervisor_uri = 'qemu+tls://10.10.10.254/system'
    
    def __init__(self, type: Literal["ro", "rw"]):
        match type:
            case "ro":
                self.open_readonly
            case "rw":
                self.open_read_write
    
    def __enter__(self):
        return self.connection

    def __exit__(self):
        self.connection.close();
    
    def open_readonly(self):
        try:
            self.connection = libvirt.openReadOnly(self.hypervisor_uri)
        except libvirt.libvirtError as e:
            logging.error(f"Failed to open readonly libvirt connection to {self.hypervisor_uri}")
            logging.error(repr(e))
        except Exception as e:
            logging.error("Unknown error occured.")
            logging.error(repr(e))

    def open_read_write(self):
        try:
            self.connection = libvirt.open(self.hypervisor_uri)
        except libvirt.libvirtError as e:
            logging.error(f"Failed to open read-write libvirt connection to {self.hypervisor_uri}")
            logging.error(repr(e))
        except Exception as e:
            logging.error("Unknown error occured.")
            logging.error(repr(e))