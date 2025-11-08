from __future__ import annotations

import logging
import libvirt
import asyncio
import copy

from typing import Union, Optional, overload
from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machine_state.state_management import stop_machine
from modules.machine_lifecycle.models import MachineParameters, CreateMachineForm
from modules.machine_lifecycle.xml_translator import create_machine_xml, parse_machine_xml, translate_machine_form_to_machine_parameters
from modules.machine_lifecycle.disks import delete_machine_disk, machine_disks_cleanup, create_machine_disk
from modules.postgresql.main import pool, async_pool
from modules.postgresql.simple_select import select_single_field

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
    
    # List of created disks to be passed to cleanup function on failure
    created_disks = []
    
    system_disk_uuid = create_machine_disk(machine.system_disk)
    created_disks.append(system_disk_uuid)
    # Modify original MachineParameters instance to include generated disk UUID which will be included in machine XML volume mapping
    machine.system_disk.uuid = system_disk_uuid
    
    if machine.additional_disks:
        for disk in machine.additional_disks:
            disk_uuid = create_machine_disk(disk)
            created_disks.append(disk_uuid)
            # Same as with system_disk - set additional disk UUID to the one returned from the function that creates disks in storage volume
            disk.uuid = disk_uuid
            
           
    # Pass modified machine object which now includes disks UUIDs to create XML string from it which will be used for machine definition
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

async def create_machine_async(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID) -> UUID:
    """
    Creates a single machine transactionally.\n
    In the event of a failure, it rolls back DB changes and cleans up libvirt definitions.
    """
    
    machine = translate_machine_form_to_machine_parameters(machine) if isinstance(machine, CreateMachineForm) else machine
    
    machine.uuid = uuid4()
    
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
                    logger.debug(f"Inserting record into deployed_machines_owners for {machine.uuid}.")
                    await cursor.execute(insert_owner, (machine.uuid, owner_uuid))
                    
                    logger.debug(f"Inserting record(s) into deployed_machines_clients for {machine.uuid}.")
                    # Insert records to deployed_machines_clients table for every client assigned to a machine.
                    for client_uuid in machine.assigned_clients:
                        await cursor.execute(insert_client, (machine.uuid, client_uuid))
                    
                    
                    logger.debug(f"Starting parallel disk creation for machine {machine.uuid}")
                    # Creation tasks to be run concurrently in separate threads.
                    disk_tasks = [asyncio.to_thread(create_machine_disk, disk) for disk in [machine.system_disk, *(machine.additional_disks or [])]]
                    
                    created_disk_uuids = await asyncio.gather(*disk_tasks)
                    
                    # Assigned returned UUIDs to corresponding disk elements in machine model
                    machine.system_disk.uuid = created_disk_uuids[0]
                    if machine.additional_disks is not None:
                        for index, disk in enumerate(machine.additional_disks, start = 1):
                            disk.uuid = created_disk_uuids[index]
                    
                    # MachineParameters instance populated with disk UUIDs is passed on to be translated into a Libvirt accepted XML string.
                    machine_xml = create_machine_xml(machine, machine.uuid)
                    
                    
                    # Async Libvirt machines definiton. By default Libvirt operations are synchronous.
                    def define_machine():
                        with LibvirtConnection("rw") as libvirt_connection:
                            # Before the machine is actually defined the machine_xml string is automatically validated against built-in schemas by Libvirt internally.
                            # This adds another layer of protection so as to catch any misconfiguration before machine definition or runtime.
                            logger.debug(f"Defining machine {machine.uuid}.")
                            libvirt_connection.defineXMLFlags(machine_xml, libvirt.VIR_DOMAIN_DEFINE_VALIDATE)
                    
                    logger.debug(f"Awaiting {machine.uuid} machine definition.")
                    # Synchronous Libvirt logic needs to be wrapped with asyncio.to_thread() to be run in a separate thread.
                    await asyncio.to_thread(define_machine)
                    
                    logger.info(f"Machine {machine.uuid} created succesfully.")
                    return machine.uuid
                
                
                except libvirt.libvirtError as e:
                    # Run created disks cleanup.
                    # Same case as with define_machine() - machine_disks_cleanup() is synchronous and needs to be run using using asyncio in a separate thread.
                    await asyncio.to_thread(machine_disks_cleanup, machine)
                    raise Exception(f"Failed to define machine {machine.uuid} because of Libvirt error:\n{e}")
                
                except Exception as e:
                    await asyncio.to_thread(machine_disks_cleanup, machine)
                    raise Exception(f"Failed to define machine {machine.uuid}:\n{e}")


@overload             
async def create_machine_async_bulk(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID, *, machine_count: int) -> list[UUID]:...

@overload
async def create_machine_async_bulk(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID, *, group_uuid: UUID) -> list[UUID]:...


async def create_machine_async_bulk(machine: Union[MachineParameters, CreateMachineForm], owner_uuid: UUID, machine_count: Optional[int] = None, group_uuid: Optional[UUID] = None) -> list[UUID]:
    """
    Creates a number of machines transactionally in parallel.\n
    In the event of a failure, it rolls back DB changes and cleans up libvirt definitions for every machine.\n
    Either **machine_count** or **group_uuid** must be specified.
    """
    
    if (machine_count is None and group_uuid is None) or (machine_count is not None and group_uuid is not None):
        raise ValueError("Valid arguments must contain either machine_count or group_uuid. Not both, not none.")
    
    if machine_count is not None and machine_count < 1:
        raise ValueError("machine_count in async_create_machine_bulk() must be greater than or equal to 1!")
    
    group_members: list[UUID] = []
    
    if group_uuid is not None:
        group_members = select_single_field("client_uuid", "SELECT client_uuid FROM clients_groups WHERE group_uuid = %s", (group_uuid, ))
        if not group_members:
            raise Exception(f"No users found in group {group_uuid}. Cannot create machines.")
        
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
        
        if machine_count is not None:
            for machine_clone in range (machine_count):
                machine_clone = copy.deepcopy(machine)
                machine_clone.uuid = uuid4()
                machine_clones.append(machine_clone)
        
        if group_uuid is not None:
            for client_uuid in group_members:
                machine_clone = copy.deepcopy(machine)
                machine_clone.uuid = uuid4()
                machine_clone.assigned_clients = {client_uuid}
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
                    
                    
                    
                    # Async per machine disk creation
                    async def create_machine_disks_async(machine: MachineParameters):
                        logger.debug(f"Starting parallel disk creation for machine {machine.uuid}")
                        # Creation tasks to be run concurrently in separate threads.
                        disk_tasks = [asyncio.to_thread(create_machine_disk, disk) for disk in [machine.system_disk, *(machine.additional_disks or [])]]
                        
                        created_disk_uuids = await asyncio.gather(*disk_tasks)
                        
                        machine.system_disk.uuid = created_disk_uuids[0]
                        if machine.additional_disks is not None:
                            for index, disk in enumerate(machine.additional_disks, start = 1):
                                disk.uuid = created_disk_uuids[index]
                    
                        return machine
                    
                    # This step bundles all async creation functions for every machine clone, runs them concurrently and collects their results.
                    logger.debug(f"Starting disk creation for {len(machine_clones)} machines in bulk.") 
                    disk_creation_results = await asyncio.gather(
                        *(create_machine_disks_async(clone) for clone in machine_clones), 
                        return_exceptions= True
                    )
                    
                    # Check result of bulk creation. If any item in disk_creation_results is an exception then the creation failed and the transaction enters rollback state.
                    for result in disk_creation_results:
                        if isinstance(result, BaseException):
                            raise result
                    
                    logger.info(f"Succesfully created disks for {len(created_machines)} in bulk.")
                    
                    
                    
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
                    machine_creation_results = await asyncio.gather(
                        *(define_machine(clone) for clone in machine_clones),
                        return_exceptions=True
                    )
                    
                    # Check result of bulk creation. If any item in machine_creation_results is an exception then the creation failed and the transaction enters rollback state.
                    for result in machine_creation_results:
                        if isinstance(result, BaseException):
                            raise result
                        # If no exception occured then the result is the UUID of created machine
                        created_machines.append(result)
                        
                    logger.info(f"Succesfully created {len(created_machines)} machines transactionally.")
                    return created_machines

                except Exception as e:
                    # Bundle all of the cleanup tasks
                    logger.warning(f"Bulk machine creation failed.")
                    logger.debug(f"Initiating rollback of {len(created_machines)} machines...")
                    await asyncio.gather(*(delete_machine_async(created_machine) for created_machine in created_machines))
                    raise Exception(f"Error during bulk creation: {e}.\nRolled back {len(created_machines)} machines.")


async def delete_machine_async(machine_uuid: UUID) -> bool:
    """
    Deletes a machine and other associated elements (DB entries, disks) asynchronously.\n
    Returns True if all of the elements are deleted succesfully, False otherwise.\n\n
    This function tries to delete as many elements associated with a given machine as possible.
    Because of this, it does not throw exceptions on single step failed but continues with components removal.\n
    Appropriate exceptions are thrown when the removal step fails.
    """
    
    # Avoid machine_parameters from being unbound between different try statements
    machine_parameters = None
    success = True
    
    # Read machine XML config and retrieve running configuration.
    try:
        def get_machine_xml():
            with LibvirtConnection("ro") as libvirt_connection:
                logger.debug(f"Fetching {machine_uuid} XML config.")
                machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                return machine.XMLDesc(libvirt.VIR_DOMAIN_XML_INACTIVE)
                
        
        logger.debug(f"Awaiting {machine_uuid} XML config fetch.")
        raw_machine_xml = await asyncio.to_thread(get_machine_xml)
        
        logger.debug(f"Parsing {machine_uuid} XML config back to MachineParameters model.")
        machine_parameters = parse_machine_xml(raw_machine_xml)
        
    except libvirt.libvirtError as e:
        logger.exception(f"Failed to get XML configuration of machine {machine_uuid} because of Libvirt error: {e}")
        success = False
        
    except Exception as e:
        logger.exception(f"Unexpected error while getting XML configuration of machine {machine_uuid}:\n{e}")
        success = False

    try:
        # Stop machine asynchronously.
        await stop_machine(machine_uuid)
    except Exception as e:
        logger.warning(f"Failed to stop machine {machine_uuid}!")
        success = False
    
    
    
    try:
        # If machine_parameters was succesfully populated with values from XML configuration in the previous step then begin disks cleanup
        # In case the machine_parameters is not a valid instance of MachineParameters model, this step is skipped.
        if isinstance(machine_parameters, MachineParameters):
            
            system_disk = machine_parameters.system_disk
            additional_disks = machine_parameters.additional_disks
            
            disk_tasks = []
            
            if system_disk.uuid is not None:
                logger.debug(f"Deleting machine {machine_uuid} system disk.")
                disk_tasks.append(asyncio.to_thread(delete_machine_disk, system_disk.uuid, system_disk.pool))
            
            if additional_disks is not None:
                logger.debug(f"Deleting machine {machine_uuid} additional disks.")
                for disk in additional_disks:
                    if disk.uuid is not None:
                        disk_tasks.append(asyncio.to_thread(delete_machine_disk, disk.uuid, disk.pool))
            
            if disk_tasks:
                logger.debug(f"Scheduling deletion for the disks of machine {machine_uuid}")
                await asyncio.gather(*disk_tasks)
                
        else:
            logger.error(f"Failed to automatically delete disks created for machine {machine_uuid}.\nManual cleanup required!")
    
    except Exception as e:
        logger.exception(f"Disk cleanup failed for machine {machine_uuid}: {e}")
           
            
    
    try:
        # Delete records associated with a machine from the DB.
        delete_machine = """
            DELETE FROM deployed_machines_owners WHERE machine_uuid = %s;
        """
        
        logger.debug(f"Deleting machine {machine_uuid} DB records.")
        async with async_pool.connection() as connection:
            async with connection.cursor() as cursor:
                async with connection.transaction():
                    await cursor.execute(delete_machine, (machine_uuid,))
    
    except Exception as e:
        logger.exception(f"Failed to delete all components associated with a machine {machine_uuid}: {e}")
        success = False
    
    
    
    try:
        def undefine_machine():
            with LibvirtConnection("rw") as libvirt_connection:
                try:
                    logger.debug(f"Trying to undefine machine {machine_uuid} configuration.")
                    machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                    machine.undefineFlags(libvirt.VIR_DOMAIN_UNDEFINE_NVRAM)
                except libvirt.libvirtError as e:
                    logger.warning(f"Failed to undefine machine {machine_uuid} because of Libvirt error: {e}")
        
        await asyncio.to_thread(undefine_machine)
    
    except Exception as e:
        logger.warning(f"Failed to undefine machine {machine_uuid}: {e}")
        success = False
    
    if success:
        logger.info(f"Succesfully deleted machine {machine_uuid} and all of the associated elements.")
    else:
        logger.warning(f"Failed to delete machine {machine_uuid}.\n Manual cleanup required!")

    return success