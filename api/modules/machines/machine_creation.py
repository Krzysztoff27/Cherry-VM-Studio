from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union, Optional, Any
from uuid import UUID

from modules.machines.models import MachineParameters, MachineDisk, MachineNetworkInterface, MachineMetadata, GroupMetadata, StoragePool, MachineGraphicalFramebuffer, NetworkInterfaceSource
from modules.libvirt_socket import LibvirtConnection
from modules.postgresql import pool, select_schema
from modules.cherry_socket import CherrySocketClient

logger = logging.getLogger(__name__)

# Helper functions for creating XML string based on MachineParameters model
# and parsing XML strings back to MachineData model

################################
#   XML elements creation
################################

"""
++++++++======---------::::::.:.....................................::::-
++++++++++====-----------=*+-.......::.............................:::::-
*+++++++++===----------+%@@@##*+++++#*+====++#*++-..................:::::
**+++++++++===-------=%@@@@@@@@%%####*+***#%%%%%%#+..............::::::::
+***++++++++====----+%%@@@@@@@%%%#*+#####%%#%%%%%%#-...........:::::...::
++*+++++++++======-=#@@@@@@@@@@@%%##%#####%%%%#%%%%#:..--....:::::::::::-
++++++++++++=+======*@@@@@%@@@%@%@@##@@@%%%+@@#*%###...:+#%-:.::::::::---
*******++++++++++====#@@@@@@@%%@@@@@@@@@@%%%%%%%%##+:::::=%%=::::.:::----
#****+*++++++++++++===+@@@@@@@@@@%%@@%%%@%%%%%%%##=::::::::#%#::::::-----
****+++++++++++++++======*@@@@@@@%%%%%%@@@%%%%#+:..........:#+=:::-------
***+++++++++++++++=========+@@@@@@@@@@@@%@@%*-:.........:-:-+%%++++------
******+++++++=+++=============@@@@@@@@@@@@+:::.......:::+#=*%##%@%%=-----
********+++++++++++===========*@@@@@@@@+----::::::.::::-##*#*#%@@@%%=----
*******+*++++++++++=+=========+@@@@@@@@*---:-:::::::::::-**##%%@%%%%=-:--
##*#********+++++++++++++======%@@@@@@@@+---::-:-:-:-::::-###%%%%%%%-::::
##*#*********++++++++++++=======@@@@@@@@#----:-::::-:-::::-+##%%%#%*---==
###*******+*++++++++++++++======@@@@@@@@@*-----:-:::::::::--+%#%#%%=:--==
####****++++++++++++*#*+-.:.--+#@@@@@@@@#=:.....::.....::::--+%%%##+=====
###***************##%%@@@@@@%@@@@@@@@@@@@%*---..-======---::::%%%%%*=====
##**************#@@@@@@@@@@@@@@@@@@@@@#++++=-::=+####++**+-:::#%%%%#=====
##**#*********##@@@@@@@@@@@@@@@@@@@%%%#####+===*#%%%%#+---=--=#%%%#%+====
###############@@@@@@@@@@@@@@%%@@@%%%%%%##*+++*##@@%##+=-:-===%%%%##*===+
#############%@@@@@@@@@@@@@%%%%%%%%%%%%##*++**###%@@%%##+--=++#%%####++++
###########%@@@@@@@@@@@@@@@%%#%%%%%%%%%#########%%@@@%##+=-=+####%#%%++++
##########@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%#####%%@@@@@%%%%#*+++#%#%%%%%++++
%#######%@@@@@@@@@@@@@@@@@@%%%%@@%%%@@%%#####%@@@@@@%%#%%###+=%%%%%%%++++
"""

def create_machine_disk_xml(root_element: ET.Element, machine_disk: MachineDisk, system: bool) -> ET.Element:
    disk = ET.SubElement(root_element, "disk", type="file", device="disk")
    
    ET.SubElement(disk, "alias", name=machine_disk.name)
    ET.SubElement(disk, "driver", name="qemu", type=machine_disk.type)
    
    # Verified by MachineDisk model validator
    assert machine_disk.source is not None
    ET.SubElement(disk, "source", pool=machine_disk.source.pool, volume=machine_disk.source.volume)
        
    if system:
        ET.SubElement(disk, "target", dev="sda", bus="virtio")
        ET.SubElement(disk, "boot", order="1")
    else:
        ET.SubElement(disk, "target", dev=machine_disk.name, bus="virtio")
    return disk


def create_machine_network_interface_xml(root_element: ET.Element, network_interface: MachineNetworkInterface) -> ET.Element:
    iface = ET.SubElement(root_element, "interface", type=network_interface.source.type)
    
    ET.SubElement(iface, "alias", name=network_interface.name)

    source_attribute = {network_interface.source.type: network_interface.source.value}
    ET.SubElement(iface, "source", attrib=source_attribute)
    
    ET.SubElement(iface, "model", type="virtio")
    return iface


def create_machine_graphics_xml(root_element: ET.Element, framebuffer: MachineGraphicalFramebuffer) -> ET.Element:
    if framebuffer.port == "auto":
        graphics = ET.SubElement(root_element, "graphics", type=framebuffer.type, autoport="yes")
    else:
        graphics = ET.SubElement(root_element, "graphics", type=framebuffer.type, autoport="no", port=framebuffer.port)
    
    if framebuffer.listen_type == "network":
        assert framebuffer.listen_network is not None
        ET.SubElement(graphics, "listen", type=framebuffer.listen_type, network=framebuffer.listen_network)
    elif framebuffer.listen_type == "address":
        assert framebuffer.listen_address is not None
        ET.SubElement(graphics, "listen", type=framebuffer.listen_type, address=framebuffer.listen_address)
    
    return graphics
   
    
def create_machine_xml(machine: MachineParameters) -> str:
    """
    Gets MachineParameters object and creates XML string based on it.
    """
    domain = ET.Element("domain", type="kvm")
    
    uuid = ET.SubElement(domain, "uuid")
    uuid.text = str(machine.uuid)
    
    name = ET.SubElement(domain, "name")
    name.text = machine.name
    
    description = ET.SubElement(domain, "description")
    if machine.description:
        description.text = machine.description

    metadata = ET.SubElement(domain, "metadata")
    vm_info = ET.SubElement(metadata, "vm:info", {"xmlns:vm": "http://example.com/virtualization"})
    
    group_metadata = ET.SubElement(vm_info, f"vm:{machine.group_metadata.tag}")
    group_metadata.text = machine.group_metadata.value
    
    if machine.group_member_id_metadata:
        group_member_id_metadata = ET.SubElement(vm_info, f"vm:{machine.group_member_id_metadata.tag}")
        if machine.group_member_id_metadata.value:
            group_member_id_metadata.text = machine.group_member_id_metadata.value
    
    if machine.additional_metadata:
        for machine_metadata in machine.additional_metadata:
            tag = ET.SubElement(vm_info, f"vm:{machine_metadata.tag}")
            tag.text = str(machine_metadata.value)

    ram = ET.SubElement(domain, "memory", unit="MiB")
    ram.text = str(machine.ram)

    vcpu = ET.SubElement(domain, "vcpu")
    vcpu.text = str(machine.vcpu)
    
    os = ET.SubElement(domain, "os")
    type = ET.SubElement(os, "type")
    type.text = "hvm"
    
    features = ET.SubElement(domain, 'features')
    ET.SubElement(features, 'acpi')
    ET.SubElement(features, 'apic')
    ET.SubElement(features, 'pae')
    
    cpu = ET.SubElement(domain, 'cpu', mode='host-model', check='partial')
    ET.SubElement(cpu, 'model', fallback='allow')
    
    ET.SubElement(domain, 'on_poweroff').text = 'destroy'
    ET.SubElement(domain, 'on_reboot').text = 'restart'
    ET.SubElement(domain, 'on_crash').text = 'restart'
    
    devices = ET.SubElement(domain, "devices")
    
    create_machine_disk_xml(devices, machine.system_disk, True)
    
    cdrom = ET.SubElement(domain, "disk", type="volume", device="cdrom")
    ET.SubElement(cdrom, "alias", name="cd-rom")
    ET.SubElement(cdrom, "driver", name="qemu", type="raw")
    
    if machine.iso_image:
        if isinstance(machine.iso_image, StoragePool):
            ET.SubElement(cdrom, "source", pool=machine.iso_image.pool, volume=machine.iso_image.volume)
        else:
            raise ValueError("iso_image must be of type StoragePool")
            
    ET.SubElement(cdrom, "target", dev="sdb", bus="virtio")
    ET.SubElement(cdrom, "readonly")
    ET.SubElement(cdrom, "boot", order="2")
    
    
    if machine.additional_disks:
        for disk in machine.additional_disks:
            create_machine_disk_xml(devices, disk, False)

    if machine.network_interfaces:
        for nic in machine.network_interfaces:
            create_machine_network_interface_xml(devices, nic)

    create_machine_graphics_xml(devices, machine.framebuffer)

    video = ET.SubElement(devices, "video")
    model = ET.SubElement(video, "model", type="virtio", heads="1")
    ET.SubElement(model, "resolution", x="1920", y="1080")

    # Output XML as a string
    machine_xml = ET.tostring(domain, encoding="unicode")
    return machine_xml

################################
#   XML elements parsing
################################

def get_required_xml_tag(root_element: ET.Element, path: str, namespaces: Optional[dict[str, str]] = None) -> ET.Element:
    """
    Finds XML tag. Raises error if tag is missing.
    """
    tag = root_element.find(path=path, namespaces=namespaces)
    
    if tag is None:
        raise ValueError(f"Element {path} not found in XML string.")
    return tag


def get_required_xml_tag_text(root_element: ET.Element, path: str, namespaces: Optional[dict[str, str]] = None) -> str:
    """
    Finds XML tag text property. Raises error if tag is missing.
    """ 
    text = root_element.findtext(path=path, namespaces=namespaces)
    
    if text is None:
        raise ValueError(f"Element {path} not found in XML string.")
    return text


def get_required_xml_tag_attribute(root_element: ET.Element, key: str, default: Optional[Any] = None):
    """
    Finds XML tag attribute. Raises error if tag is missing.
    """ 
    text = root_element.get(key=key, default=default)
    
    if text is None:
        raise ValueError(f"Attribute {key} not found in XML tag {root_element}.")
    return text


def parse_machine_disk(disk_element: ET.Element) -> MachineDisk:
    """
    Parse <disk> element back into MachineDisk model.
    """
    # Name
    alias_el = get_required_xml_tag(disk_element, "alias")
    name = get_required_xml_tag_attribute(alias_el, "name")
    
    # Source
    allowed_pool_types = ["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]
    source_el = get_required_xml_tag(disk_element, "source")
    
    if "pool" in source_el.attrib and "volume" in source_el.attrib:
        pool=get_required_xml_tag_attribute(source_el, "pool")
        
        if pool not in allowed_pool_types:
            raise ValueError(f"StoragePool pool cannot be of type: {pool}")
        else:
            source = StoragePool(
                pool=pool, # type: ignore - pool type is checked against allowed pool types after being fetched from the XML string
                volume=get_required_xml_tag_attribute(source_el, "volume")
            )
    else:
        raise ValueError(f"Disk source not found or is of unsupported type. It must be either file or storage pool.")
    
    # Size
    # Retrieve disk size from CherrySocket - not kept under libvirt XML + disks are dynamic
    with CherrySocketClient() as cherry_socket:
        response = cherry_socket.call("get_machine_disk_size", source.model_dump())
        if response["capacity"] is not None:
            size = response["capacity"]
        else:
            raise ValueError(f"Could not retrieve {source.volume} size")
    
    # Type
    allowed_disk_types = ["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"] 
    driver_el = get_required_xml_tag(disk_element, "driver")
    type = get_required_xml_tag_attribute(driver_el, "type")
    
    if type not in allowed_disk_types:
        raise ValueError(f"MachineDisk cannot be of type: {type}")

    return MachineDisk(
        name=name,
        source=source,
        size=size,
        type=type     # type: ignore - type is checked against allowed disk types after being fetched from the XML string
    )


def parse_machine_network_interface(iface_element: ET.Element) -> MachineNetworkInterface | None:
    """
    Parse <interface> element back into MachineNetworkInterface model.
    """
    # Name
    alias_el = get_required_xml_tag(iface_element, "alias")
    name = get_required_xml_tag_attribute(alias_el, "name")

    # Source type and value
    source_el = get_required_xml_tag(iface_element, "source")
    source_type = None
    source_value = None
    
    for key, value in source_el.attrib.items():
        source_type = key
        source_value = value
        break

    allowed_source_types = ["network", "bridge"]
    if source_type not in allowed_source_types:
        raise ValueError(f"source_type cannot be: {source_type}")
    
    if source_value is None:
        raise ValueError(f"source_value cannot be empty")
    
    source = NetworkInterfaceSource(type=source_type, value=source_value) # type: ignore

    return MachineNetworkInterface(
        name=name,
        source=source
    )


def parse_machine_graphics(graphics_element: ET.Element) -> MachineGraphicalFramebuffer:
    """
    Parse <graphics> element back into MachineGraphicalFramebuffer model.
    """
    allowed_types = ["rdp", "vnc"]
    type = get_required_xml_tag_attribute(graphics_element, "type")
    
    if type not in allowed_types:
        raise ValueError(f"Graphical framebuffer must be either 'rdp' or 'vnc' and not {type}.")
    autoport = get_required_xml_tag_attribute(graphics_element, "autoport")
    
    if autoport == "yes":
        port = "auto"
    else:
        port = autoport

    listen_network = None
    listen_address = None

    listen_el = get_required_xml_tag(graphics_element, "listen")
    listen_type = get_required_xml_tag_attribute(listen_el, "type")
    if listen_type == "network":
        listen_network = listen_el.get("network")
    elif listen_type == "address":
        listen_address = listen_el.get("address")
    else:
        raise ValueError(f"listen_type must be either 'network' or 'address' and not {listen_type}.")

    return MachineGraphicalFramebuffer(
        type=type, # type: ignore
        port=port,
        listen_type=listen_type,
        listen_network=listen_network,
        listen_address=listen_address,
    )


def parse_machine_xml(machine_xml: str) -> MachineParameters:
    """
    Gets XML string and parses it back into a MachineParameters object.\n
    Only parses elements that exist in MachineParameters model.
    """
    try:
        domain = ET.fromstring(machine_xml)
        
        uuid = UUID(get_required_xml_tag_text(domain, "uuid"))
        name = get_required_xml_tag_text(domain, "name")
        description = get_required_xml_tag_text(domain, "description")


        additional_metadata = []
        metadata_el = get_required_xml_tag(domain, "metadata/vm:info", {"vm": "http://example.com/virtualization"})
        group_metadata = GroupMetadata(value=get_required_xml_tag_text(metadata_el, "vm:group", {"vm": "http://example.com/virtualization"}))
        
        for child in metadata_el:
            tag = child.tag.split("}", 1)[-1]  # strip namespace
            if tag not in ["group", "groupMemberId"] and child.text is not None:
                additional_metadata.append(MachineMetadata(tag=tag, value=child.text))


        ram = int(get_required_xml_tag_text(domain, "memory"))
        vcpu = int(get_required_xml_tag_text(domain, "vcpu"))


        devices_el = get_required_xml_tag(domain, "devices")
        system_disk = None
        additional_disks = []

        # Disks
        
        iso_image = None
        
        for disk_element in devices_el.findall("disk"):
            device_type = get_required_xml_tag_attribute(disk_element, "device")
            
            if device_type == "cdrom":
                source_element = get_required_xml_tag(disk_element, "source")
                if "pool" in source_element.attrib and "volume" in source_element.attrib:
                    allowed_pool_types = ["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]
                    pool = get_required_xml_tag_attribute(source_element, "pool")
                    if pool not in allowed_pool_types:
                        raise ValueError(f"pool cannot be {pool}")
                    
                    iso_image = StoragePool(
                        pool = get_required_xml_tag_attribute(source_element, "pool"), # type: ignore
                        volume = get_required_xml_tag_attribute(source_element, "volume")
                    )
                    

            boot_element = get_required_xml_tag(disk_element, "boot")
            if get_required_xml_tag_attribute(boot_element, "order") == "1":
                system_disk = parse_machine_disk(disk_element)
            else:
                additional_disks.append(parse_machine_disk(disk_element))
        
        if system_disk is None:
            raise ValueError("No system disk found in domain XML (missing <boot order='1'>).")

        # Network interfaces
        network_interfaces = []
        for iface_element in devices_el.findall("interface"):
            network_interfaces.append(parse_machine_network_interface(iface_element))

        # Framebuffer
        graphics_element = get_required_xml_tag(devices_el, "graphics")
        framebuffer = parse_machine_graphics(graphics_element)

        return MachineParameters(
            uuid=uuid,
            name=name,
            description=description,
            group_metadata=group_metadata,
            group_member_id_metadata=None,
            additional_metadata=additional_metadata if additional_metadata else None,
            ram=ram,
            vcpu=vcpu,
            system_disk=system_disk,
            additional_disks=additional_disks if additional_disks else None,
            iso_image=iso_image,  # not stored in XML yet
            network_interfaces=network_interfaces if network_interfaces else None,
            framebuffer=framebuffer,
        )
        
    except ValueError as e:
        raise ValueError(f"Failed to parse machine XML: {e}")
        
################################
# Machine components creation
################################
def create_machine_disk(machine_disk: MachineDisk) -> dict:
    with CherrySocketClient() as cherry_socket:
        response = cherry_socket.call("create_machine_disk", machine_disk.model_dump())
        return response


################################
#  Machine creation actions
################################

def create_machine(machine: Union[str, MachineParameters]) -> None:
    """
    Creates non-persistent machine - no configuration template in database.
    """
    machine_xml = create_machine_xml(machine) if isinstance(machine, MachineParameters) else machine

    with LibvirtConnection("rw") as libvirt_connection:
        try:
            libvirt_connection.defineXML(machine_xml)
        except libvirt.libvirtError as e:
            logger.error(f"Failed to define machine: {e}")
        except Exception as e:
            logger.exception(e)
            
        logger.debug(f"Defined machine {machine_xml}")
    
    
def create_machine_snapshot(machine: Union[str, MachineParameters]) -> None:
    pass

# Experimental functions - to be implemented in the future
def create_machine_template(machine: Union[str, MachineParameters]) -> None:
    """
    Create machine template (database record) without creating the machine itself.
    """
    machine = parse_machine_xml(machine) if isinstance(machine, str) else machine

    with pool.connection() as connection:
        with connection.cursor() as cursor: 
            with connection.transaction():
                cursor.execute(f"""
                            INSERT INTO machine_templates (uuid, name, description, group_metadata, group_member_id_metadata, additional_metadata, ram, vcpu, os_type, disks, username, password, network_interfaces)
                            VALUES (%(uuid)s, %(name)s, %(description)s, %(group_metadata)s, %(group_member_id_metadata)s, %(additional_metadata)s, %(ram)s, %(vcpu)s, %(os_type)s, %(disks)s, %(username)s, %(password)s, %(network_interfaces)s)
                            """, machine.model_dump())


def create_machine_from_template(template_uuid: UUID) -> None:
    """
    Creates machine based on configuration template from database.
    """
    machine_template = select_schema(MachineParameters, "SELECT * FROM machine_templates WHERE uuid = %s", (template_uuid,))[0]
    create_machine(machine_template)
 
    
def create_template_from_machine(machine_uuid: UUID) -> None:
    """
    Creates machine template based on a running machine.
    """
    with LibvirtConnection("ro") as libvirt_connection:
        try:
            machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
            raw_machine_xml = machine.XMLDesc(libvirt.VIR_DOMAIN_XML_INACTIVE)
            create_machine_template(raw_machine_xml)
        except libvirt.libvirtError as e:
            logger.error(f"Failed to get XML of machine: {e}")
        except Exception as e:
            logger.exception(e)
        
        logger.debug(f"Created template from machine of UUID: {machine_uuid}")