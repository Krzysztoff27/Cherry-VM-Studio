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
from modules.machine_resources.template_library import create_machine_template

logger = logging.getLogger(__name__)

# Experimental functions - to be implemented in the futur

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