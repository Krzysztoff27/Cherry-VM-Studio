from __future__ import annotations

import logging
import libvirt
import asyncio
import copy

from typing import Union
from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machine_state.state_management import stop_machine
from modules.machine_lifecycle.models import MachineParameters, CreateMachineForm
from modules.machine_lifecycle.xml_translator import create_machine_xml, parse_machine_xml, translate_machine_form_to_machine_parameters
from modules.machine_lifecycle.disks import delete_machine_disk, machine_disks_cleanup
from modules.postgresql.main import pool, async_pool

logger = logging.getLogger(__name__)

################################
#  Machine lifecycle actions
################################

def create_machine(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID) -> UUID:
    """
    Creates a non-persistent machine - no configuration template in the database.
    """
    machine = translate_machine_form_to_machine_parameters(machine) if isinstance(machine, CreateMachineForm) else machine
    
    machine_uuid = uuid4()
    
    machine_xml = create_machine_xml(machine, machine_uuid)
    
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
                    
                    cursor.execute(insert_owner, (machine_uuid, owner_uuid))
                    
                    for client_uuid in machine.assigned_clients:
                        cursor.execute(insert_client, (machine_uuid, client_uuid))
                        
                except Exception as e:
                    raise Exception(f"Failed to create database records associated with a machine of UUID={machine_uuid}", e)
            
    
    with LibvirtConnection("rw") as libvirt_connection:
        try:
            libvirt_connection.defineXML(machine_xml)
            logger.debug(f"Defined machine {machine_xml}")
            return machine_uuid
        except libvirt.libvirtError as e:
            if not machine_disks_cleanup(machine):
                logger.error(f"Failed to cleanup disks created for a machine that wasn't succesfully defined.\n Manual cleanup required!")
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


################################
#  Dedicated async functions
################################

async def async_create_machine(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID) -> UUID:
    """
    Creates a single machine transactionally.\n
    In the event of a failure, it rolls back DB changes and cleans up libvirt definitions.
    """
    
    machine = translate_machine_form_to_machine_parameters(machine) if isinstance(machine, CreateMachineForm) else machine
    
    machine_uuid = uuid4()
    
    machine_xml = create_machine_xml(machine, machine_uuid)
    
    insert_owner = """
        INSERT INTO deployed_machines_owners (machine_uuid, owner_uuid)
        VALUES (%s, %s);
    """
    
    insert_client = """
        INSERT INTO deployed_machines_clients (machine_uuid, client_uuid)
        VALUES (%s, %s);
    """
    
    async with async_pool.connection() as connection:
        async with connection.cursor() as cursor:
            async with connection.transaction():
                try:
                    # At this stage the records are not commited yet. They will remain in this state until the machine is sucessfully defined through the Libvirt API (when no exceptions occur).
                    
                    # Insert record to deployed_machines_owners table.
                    logger.debug(f"Inserting record into deployed_machines_owners for {machine_uuid}.")
                    await cursor.execute(insert_owner, (machine_uuid, owner_uuid))
                    
                    logger.debug(f"Inserting record(s) into deployed_machines_clients for {machine_uuid}.")
                    # Insert records to deployed_machines_clients table for every client assigned to a machine.
                    for client_uuid in machine.assigned_clients:
                        await cursor.execute(insert_client, (machine_uuid, client_uuid))
                        
                    
                    # Async Libvirt machines definiton. By default Libvirt operations are synchronous.
                    def define_machine():
                        with LibvirtConnection("rw") as libvirt_connection:
                            # Before the machine is actually defined the machine_xml string is automatically validated against built-in schemas by Libvirt internally.
                            # This adds another layer of protection so as to catch any misconfiguration before machine definition or runtime.
                            logger.debug(f"Defining machine {machine_uuid}.")
                            libvirt_connection.defineXMLFlags(machine_xml, libvirt.VIR_DOMAIN_DEFINE_VALIDATE)
                    
                    logger.debug(f"Awaiting {machine_uuid} machine definition.")
                    # Synchronous Libvirt logic needs to be wrapped with asyncio.to_thread() to be run in a separate thread.
                    await asyncio.to_thread(define_machine)
                    
                    logger.info(f"Machine {machine_uuid} created succesfully.")
                    return machine_uuid
                
                except libvirt.libvirtError as e:
                    # Run created disks cleanup.
                    # Same case as with define_machine() - machine_disks_cleanup() is synchronous and needs to be run using using asyncio in a separate thread.
                    await asyncio.to_thread(machine_disks_cleanup, machine)
                    raise Exception(f"Failed to define machine {machine_uuid} because of Libvirt error:\n{e}")
                
                except Exception as e:
                    await asyncio.to_thread(machine_disks_cleanup, machine)
                    raise Exception(f"Failed to define machine {machine_uuid}:\n{e}")
                

async def async_create_machine_bulk(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID, machine_count: int) -> list[UUID]:
    """
    Creates a number of machines transactionally in parallel.\n
    In the event of a failure, it rolls back DB changes and cleans up libvirt definitions for every machine.
    """
    
    if machine_count < 1:
        raise ValueError("machine_count in async_create_machine_bulk() must be greater than or equal to 1!")
    
    machine = translate_machine_form_to_machine_parameters(machine) if isinstance(machine, CreateMachineForm) else machine
    
    insert_owner = """
        INSERT INTO deployed_machines_owners (machine_uuid, owner_uuid)
        VALUES (%s, %s);
    """
    
    insert_client = """
        INSERT INTO deployed_machines_clients (machine_uuid, client_uuid)
        VALUES (%s, %s);
    """
    
    created_machines: list[UUID] = []
    
    machine_clones: list[MachineParameters] = []
    
    # Creating a number of machines requires that for every on of them a new UUID is generated.
    # In the future, to distinguish between different machines of the same "title" an ordinal number kept in the metadata will be added to the "title" property of a machine.
    
    try:
        logger.debug("Creating machine clones.")
        for machine_clone in range (machine_count):
            machine_clone = copy.deepcopy(machine)
            machine_clone.uuid = uuid4()
            machine_clones.append(machine_clone)
    except Exception as e:
        raise Exception(f"Failed to create machine clones for bulk creation in the number of {machine_count}:\n{e}")
        
    async with async_pool.connection() as connection:
        async with connection.cursor() as cursor:
            async with connection.transaction():
                try:
                    # At this stage the records are not commited yet. They will remain in this state until all machines are sucessfully defined through the Libvirt API (when no exceptions occur).
                    
                    for machine_clone in machine_clones:
                        # Insert record to deployed_machines_owners table for every machine clone.
                        logger.debug(f"Inserting record into deployed_machines_owners for {machine_clone.uuid}.")
                        await cursor.execute(insert_owner, (machine_clone.uuid, owner_uuid))

                        # Insert records to deployed_machines_clients table for every client assigned to a machine.
                        logger.debug(f"Inserting record(s) into deployed_machines_clients for {machine_clone.uuid}.")
                        for client_uuid in machine_clone.assigned_clients:
                            await cursor.execute(insert_client, (machine_clone.uuid, client_uuid))
                    
                    # Async and concurrent Libvirt machines definiton. By default Libvirt operations are synchronous.
                    async def define_machine(machine: MachineParameters):
                        assert machine.uuid is not None
                        machine_xml = create_machine_xml(machine, machine.uuid)
                        
                        def define_sync():
                            with LibvirtConnection("rw") as libvirt_connection:
                                # Before the machine is actually defined the machine_xml string is automatically validated against built-in schemas by Libvirt internally.
                                # This adds another layer of protection so as to catch any misconfiguration before machine definition or runtime.
                                logger.debug(f"Defining machine {machine.uuid}.")
                                libvirt_connection.defineXMLFlags(machine_xml, libvirt.VIR_DOMAIN_DEFINE_VALIDATE)
                        
                        logger.debug(f"Awaiting {machine.uuid} machine definition.")
                        # Synchronous Libvirt logic needs to be wrapped with asyncio.to_thread() to be run in a separate thread.
                        await asyncio.to_thread(define_sync)
                        
                        logger.debug(f"Machine {machine.uuid} created succesfully.")
                        return machine.uuid
                    
                    # This step bundles all async creation functions for every machine clone, runs them concurrently and collects their results.
                    bulk_creation = await asyncio.gather(
                        *(define_machine(clone) for clone in machine_clones),
                        return_exceptions=True
                    )
                    
                    # Check result of bulk creation. If any item in bulk_creation is an exception then the creation failed and the transaction enters rollback state.
                    for result in bulk_creation:
                        if isinstance(result, BaseException):
                            raise result
                        # If no exception occured then the result is the UUID of created machine
                        created_machines.append(result)
                        
                    logger.info(f"Succesfully created {len(created_machines)} machines transactionally.")
                    return created_machines

                except Exception as e:
                    # Bundle all of the cleanup tasks
                    logger.debug(f"Initiating rollback of {len(created_machines)} machines...")
                    await asyncio.gather(*(async_delete_machine(created_machine) for created_machine in created_machines))
                    raise Exception(f"Error during bulk creation: {e}.\nRolled back {len(created_machines)} machines.")


async def async_delete_machine(machine_uuid: UUID) -> bool:
    """
    Deletes a machine and other associated elements (DB entries, disks) asynchronously.\n
    Returns True if all of the elements are deleted succesfully, False otherwise.\n\n
    This function tries to delete as many elements associated with a given machine as possible.
    Because of this, it does not throw exceptions on single step failed but continues with components removal.\n
    Appropriate exceptions are thrown when the removal step fails.
    """
    
    # Avoid machine_parameters from being unbound
    machine_parameters = None
    
    # Read machine XML config and retrieve running configuration.
    try:
        def get_machine_xml():
            with LibvirtConnection("ro") as libvirt_connection:
                logger.debug(f"Fetching {machine_uuid} XML config.")
                machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                raw_xml = machine.XMLDesc(libvirt.VIR_DOMAIN_XML_INACTIVE)
                return raw_xml
        
        logger.debug(f"Awaiting {machine_uuid} XML config fetch.")
        raw_machine_xml = await asyncio.to_thread(get_machine_xml)
        
        logger.debug(f"Parsing {machine_uuid} XML config back to MachineParameters model.")
        machine_parameters = parse_machine_xml(raw_machine_xml)
        
    except libvirt.libvirtError as e:
        logger.exception(f"Failed to get XML configuration of machine {machine_uuid} because of Libvirt error: {e}")
        logger.error(f"Manual cleanup required for machine {machine_uuid}!")
        
    except Exception as e:
        logger.exception(f"Unexpected error while getting XML configuration of machine {machine_uuid}:\n{e}")
        logger.error(f"Manual cleanup required for machine {machine_uuid}!")
        
    # Stop and remove resources.
    try:
        # If machine_parameters was succesfully populated with values from XML configuration in the previous step then begin disks cleanup
        # In case the machine_parameters is not a valid instance of MachineParameters model, this step is skipped.
        if isinstance(machine_parameters, MachineParameters):
            
            system_disk = machine_parameters.system_disk
            additional_disks = machine_parameters.additional_disks

            # Delete system disk.
            assert system_disk.uuid is not None
            logger.debug(f"Deleting machine {machine_uuid} system disk.")
            delete_machine_disk(system_disk.uuid, system_disk.pool)
        
            # Delete any additional disks.
            if additional_disks is not None:
                logger.debug(f"Deleting machine {machine_uuid} additional disks.")
                for disk in additional_disks:
                    assert disk.uuid is not None
                    delete_machine_disk(disk.uuid, disk.pool)
                
        else:
            logger.error(f"Failed to automatically delete disks created for machine {machine_uuid}.\nManual cleanup required!")
            
        # Stop machine asynchronously.
        await stop_machine(machine_uuid)
        
        # Delete records associated with a machine from the DB.
        delete_machine = """
            DELETE * FROM deployed_machines_owners WHERE machine_uuid = %s;
        """
        
        logger.debug(f"Deleting machine {machine_uuid} DB records.")
        async with async_pool.connection() as connection:
            async with connection.cursor() as cursor:
                async with connection.transaction():
                    await cursor.execute(delete_machine, (machine_uuid,))
        
        logger.info(f"Succesfully deleted machine {machine_uuid}.")
        return True
    
    except Exception as e:
        logger.exception(f"Failed to delete all components associated with a machine {machine_uuid}: {e}")
        logger.error(f"Manual cleanup required for machine {machine_uuid}!")
        return False
