import logging
import xml.etree.ElementTree as ET
from application.machines.models import MachineParameters
from application.libvirt_socket import LibvirtConnection

logger = logging.getLogger(__name__)

def create_machine_xml(machine: MachineParameters) -> str:
    # Root - domain tag
    domain = ET.Element("domain", type="kvm")
    
    # Name
    name = ET.SubElement(domain, "name")
    name.text = machine.name

    # Metadata
    metadata = ET.SubElement(domain, "metadata")
    vm_info = ET.SubElement(metadata, "vm:info", {"xmlns:vm": "http://example.com/virtualization"})
    for machine_metadata in machine.metadata:
        tag = ET.SubElement(vm_info, f"vm:{machine_metadata.tag}")
        tag.text = str(machine_metadata.value)

    # Memory
    mem = ET.SubElement(domain, "memory", unit="MiB")
    mem.text = str(machine.ram)

    # vCPU
    vcpu = ET.SubElement(domain, "vcpu", placement="static")
    vcpu.text = str(machine.vcpu)

    # OS
    os_el = ET.SubElement(domain, "os")
    type_el = ET.SubElement(os_el, "type", arch="x86_64", machine="pc-i440fx-2.9")
    type_el.text = machine.os_type
    ET.SubElement(os_el, "boot", dev="hd")
    ET.SubElement(os_el, "boot", dev="cdrom")
    ET.SubElement(os_el, "acpi")
    ET.SubElement(os_el, "apic")
    ET.SubElement(os_el, "pae")
    
    # Policies
    ET.SubElement(domain, "on_poweroff").text = "destroy"
    ET.SubElement(domain, "on_reboot").text = "restart"
    ET.SubElement(domain, "on_crash").text = "restart"
    
    # Devices
    devices = ET.SubElement(domain, "devices")
    ET.SubElement(devices, "emulator").text = "/usr/bin/qemu-system-x86_64"
     
    # Disks
    for disk in machine.disks:
        disk_el = ET.SubElement(devices, "disk", type="file", device="disk")
        ET.SubElement(disk_el, "alias", name=disk.name)
        ET.SubElement(disk_el, "driver", name="qemu", type=disk.type)
        ET.SubElement(disk_el, "source", file=disk.filepath)
        # ET.SubElement(disk_el, "target", dev=disk.name, bus="virtio")

    # Network Interfaces
    for nic in machine.network_interfaces:
        iface = ET.SubElement(devices, "interface", type="network")
        ET.SubElement(iface, "source", network=nic.name)
        ET.SubElement(iface, "model", type="virtio")

    # Graphics
    ET.SubElement(devices, "graphics", type="vnc", port="-1", autoport="yes", listen="0.0.0.0")

    # Video
    video = ET.SubElement(devices, "video")
    ET.SubElement(video, "model", type="vga", vram="16384", heads="1", primary="yes")

    # Output XML string
    xml_str = ET.tostring(domain, encoding="unicode")
    return xml_str

def define_machine

