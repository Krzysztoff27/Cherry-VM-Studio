from __future__ import annotations

import logging
import libvirt

from typing import Union
from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machines_state.state_management import stop_machine
from modules.machine_lifecycle.models import MachineParameters
from modules.machine_lifecycle.xml_translator import create_machine_xml, parse_machine_xml
from modules.machine_lifecycle.disks import delete_machine_disk

logger = logging.getLogger(__name__)

################################
#  Machine lifecycle actions
################################

def create_machine(machine: Union[str, MachineParameters]) -> UUID:
    """
    Creates non-persistent machine - no configuration template in database.
    """
    machine_uuid = uuid4()
    machine_xml = create_machine_xml(machine, machine_uuid) if isinstance(machine, MachineParameters) else machine
        
    with LibvirtConnection("rw") as libvirt_connection:
        try:
            libvirt_connection.defineXML(machine_xml)
            logger.debug(f"Defined machine {machine_xml}")
            return machine_uuid
        except libvirt.libvirtError as e:
            raise Exception(f"Failed to define machine: {e}")
        except Exception as e:
            raise Exception(e)
           
async def delete_machine(machine_uuid: UUID) -> bool:
    with LibvirtConnection("ro") as libvirt_connection:
        try:
            machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
            raw_machine_xml = machine.XMLDesc(libvirt.VIR_DOMAIN_XML_INACTIVE)
            machine_parameters = parse_machine_xml(raw_machine_xml)
        except libvirt.libvirtError as e:
            raise Exception(f"Failed to get XML of machine: {e}")
        except Exception as e:
            raise Exception(e)
    
    try:
        system_disk = machine_parameters.system_disk
        additional_disks = machine_parameters.additional_disks
        
        assert system_disk.uuid is not None
        delete_machine_disk(system_disk.uuid, system_disk.pool)
        
        if additional_disks is not None:
            for disk in additional_disks:
                assert disk.uuid is not None
                delete_machine_disk(disk.uuid, disk.pool)
        
        await stop_machine(machine_uuid)
        
        return True
    
    except Exception as e:
        return False