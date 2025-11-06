from __future__ import annotations

import logging
import libvirt

from typing import Union
from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machine_state.state_management import stop_machine
from modules.machine_lifecycle.models import MachineParameters, CreateMachineForm
from modules.machine_lifecycle.xml_translator import create_machine_xml, parse_machine_xml, translate_machine_form_to_machine_parameters
from modules.machine_lifecycle.disks import delete_machine_disk, machine_disks_cleanup
from modules.postgresql.main import pool

logger = logging.getLogger(__name__)

################################
#  Machine lifecycle actions
################################

def create_machine(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID) -> UUID:
    """
    Creates a non-persistent machine - no configuration template in the database.
    """
    machine = translate_machine_form_to_machine_parameters(machine) if isinstance(machine, CreateMachineForm) else machine
    
    machine_xml = create_machine_xml(machine, machine.uuid)
    
    insert_owner = """
        INSERT INTO deployed_machines_owners (machine_uuid, owner_uuid)
        VALUES (%s, %s);
    """
    
    insert_client = """
        INSERT INTO deployed_machines_clients (machine_uuid, client_uuid)
        VALUES (%s, %s);
    """
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    
                    cursor.execute(insert_owner, (machine.uuid, owner_uuid))
                    
                    for client_uuid in machine.assigned_clients:
                        cursor.execute(insert_client, (machine.uuid, client_uuid))
                        
                except Exception as e:
                    raise Exception(f"Failed to create database records associated with a machine of UUID={machine.uuid}", e)
            
    
    with LibvirtConnection("rw") as libvirt_connection:
        try:
            libvirt_connection.defineXML(machine_xml)
            logger.debug(f"Defined machine {machine_xml}")
            return machine.uuid
        except libvirt.libvirtError as e:
            if not machine_disks_cleanup(machine):
                logger.error(f"Failed to cleanup diks created for a machine that wasn't succesfully defined.\n Manual cleanup required!")
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
        
        await stop_machine(machine_uuid)
        
        assert system_disk.uuid is not None
        delete_machine_disk(system_disk.uuid, system_disk.pool)
        
        if additional_disks is not None:
            for disk in additional_disks:
                assert disk.uuid is not None
                delete_machine_disk(disk.uuid, disk.pool)

        delete_machine = """
            DELETE * FROM deployed_machines_owners WHERE machine_uuid = %s;
        """
        
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                with connection.transaction():
                    try:
                        cursor.execute(delete_machine, (machine_uuid,))
                            
                    except Exception as e:
                        raise Exception(f"Failed to delete database records associated with a machine of UUID={machine_uuid}", e)
            
        return True
    
    except Exception as e:
        logger.exception(f"Failed to delete all components associated with a machine of UUID={machine_uuid}", e)
        return False