import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union
from uuid import UUID

from application.machines.models import MachineParameters, MachineDisk, MachineMetadata, MachineNetworkInterfaces, GroupMemberIdMetadata, GroupMetadata
from application.libvirt_socket import LibvirtConnection
from application.postgresql import pool, select_schema

logger = logging.getLogger(__name__)


# Helper functions for creating XML string based on MachineParameters model
# and parsing XML strings back to MachineData model
def create_machine_xml(machine: MachineParameters) -> str:
    """
    Gets MachineParameters object and creates XML string based on it.
    """
    return "xml"

def get_required_xml_tag_text(root_element: ET.Element[str], tag: str) -> str:
    """
    Gets XML tag text property. Raises error if tag is missing.
    """ 
    text = root_element.findtext(tag)
    
    if text is None:
        raise ValueError(f"Element {tag} not found in XML string.")
    return text

def parse_machine_xml(machine_xml: str) -> MachineParameters:
    """
    Gets machine XML string and tries to parse it back to MachineParameters model.
    """
    try:
        root = ET.fromstring(machine_xml)

        name = get_required_xml_tag_text(root, "name")
        ram = int(get_required_xml_tag_text(root, "memory"))
        vcpu = int(get_required_xml_tag_text(root, "vcpu"))
        os_type = get_required_xml_tag_text(root, "os/type")


        disks = []
        for disk in root.findall("devices/disk"):
            if disk.get("device") != "disk":
                continue
            driver = disk.find("driver")
            disk_type = driver.get("type") if driver is not None else "raw"
            filepath = disk.find("source").get("file")
            target = disk.find("target").get("dev")
            size = 0  # libvirt XML doesn’t include size, would need qemu-img info
            disks.append(MachineDisk(name=target, filepath=filepath, size=size, type=disk_type))


        netifs = []
        for iface in root.findall("devices/interface"):
            target = iface.find("target")
            if target is not None:
                netifs.append(MachineNetworkInterfaces(name=target.get("dev")))

        # minimal metadata
        group_metadata = GroupMetadata(value="desktop")
        group_member_id_metadata = GroupMemberIdMetadata(value=5)

        return MachineParameters(
            name=name,
            description=None,
            group_metadata=group_metadata,
            group_member_id_metadata=group_member_id_metadata,
            additional_metadata=None,
            ram=ram,
            vcpu=vcpu,
            os_type=os_type,
            disks=disks,
            username="",
            password="",
            network_interfaces=netifs,
        )
        
    except ValueError as e:
        logger.error(f"XML parsing failed: {e}")
        raise ValueError(e)

  
# Machine creation actions
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
            machine = libvirt_connection.lookupByUUID(machine_uuid)
            raw_machine_xml = machine.XMLDesc(libvirt.VIR_DOMAIN_XML_INACTIVE)
            create_machine_template(raw_machine_xml)
        except libvirt.libvirtError as e:
            logger.error(f"Failed to get XML of machine: {e}")
        except Exception as e:
            logger.exception(e)
        
        logger.debug(f"Created template from machine of UUID: {machine_uuid}")