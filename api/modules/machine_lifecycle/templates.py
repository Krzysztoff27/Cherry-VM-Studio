from __future__ import annotations

import logging
import libvirt

from uuid import UUID
from typing import Union

from modules.libvirt_socket import LibvirtConnection
from modules.postgresql import pool, select_schema
from modules.machine_lifecycle.models import MachineParameters
from modules.machine_lifecycle.xml_translator import parse_machine_xml
from modules.machine_lifecycle.machines import create_machine

logger = logging.getLogger(__name__)

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