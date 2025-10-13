import logging

import uuid

from modules.machines.machine_creation import create_machine_xml
from modules.machines.models import MachineParameters,GroupMetadata, MachineNetworkInterface, NetworkInterfaceSource, MachineDisk, DiskType, StoragePool, MachineGraphicalFramebuffer

logger = logging.getLogger(__name__)

machine = MachineParameters(
   uuid = uuid.uuid4(),
   name = "test machine",
   description = "my machine",
   group_metadata=GroupMetadata(value="desktop"),
   ram = 4,
   vcpu = 2,
   system_disk= MachineDisk(
       name = "disk1",
       size = 500,
       type = "qcow2",
       pool_type="cvms-disk-images",
   ),
   additional_disks=[MachineDisk(name="disk2", size=200, type="qcow2", pool_type="cvms-disk-images")],
   iso_image = StoragePool(
       pool = "cvms-iso-images",
       volume = "image.iso",
   ),
   network_interfaces=[MachineNetworkInterface(name="netinf1", source=NetworkInterfaceSource(type="bridge", value="cherry-vmBr"))],
   framebuffer=MachineGraphicalFramebuffer(type="vnc", port="auto", listen_type="network", listen_network="cherry-vm")
)

print(create_machine_xml(machine))