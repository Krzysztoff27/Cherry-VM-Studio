import logging
import libvirt

from typing import Optional, Any, Literal
from xml.etree import ElementTree
from fastapi import HTTPException
from uuid import UUID
from datetime import datetime
from devtools import pprint

from modules.users.permissions import is_admin, is_client
from modules.machine_state.state_management import is_vm_loading
from modules.machine_state.models import MachineData, MachineState, StaticDiskInfo, DynamicDiskInfo
from modules.libvirt_socket import LibvirtConnection
from modules.users.models import Administrator, AdministratorInDB, AnyUser, Client, ClientInDB
from modules.postgresql import select_schema_dict, select_schema_one, select_single_field
from modules.machine_lifecycle.xml_translator import parse_machine_xml
from config import ENV_CONFIG

XML_NAME_SCHEMA = {"vm": "http://example.com/virtualization"} 

logger = logging.getLogger(__name__)

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_owner
def get_machine_owner(machine_uuid: UUID) -> AdministratorInDB | None:
    return select_schema_one(AdministratorInDB, """
        SELECT administrators.* FROM administrators
        RIGHT JOIN deployed_machines_owners ON administrators.uuid = deployed_machines_owners.owner_uuid
        WHERE deployed_machines_owners.machine_uuid = %s
    """, (machine_uuid,))


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_clients_assigned_to_machine
def get_clients_assigned_to_machine(machine_uuid: UUID) -> dict[UUID, ClientInDB]:
    return select_schema_dict(ClientInDB, "uuid", """
        SELECT clients.* FROM clients
        RIGHT JOIN deployed_machines_clients ON clients.uuid = deployed_machines_clients.client_uuid
        WHERE deployed_machines_clients.machine_uuid = %s
    """, (machine_uuid,))

    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_owner_machine_uuids
def get_owner_machine_uuids(owner: Administrator) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_owners WHERE owner_uuid = %s", (owner.uuid,))


def get_client_machine_uuids(client: Client) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_clients WHERE client_uuid = %s", (client.uuid,))


def get_all_machine_uuids() -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_owners")

    
def get_user_machine_uuids(user: AnyUser) -> list[UUID]:
    if is_admin(user): 
        return get_owner_machine_uuids(user)
    elif is_client(user): 
        return get_client_machine_uuids(user)
    return []


def check_machine_ownership(machine_uuid: UUID, user: AnyUser) -> bool:
    machine_owner = get_machine_owner(machine_uuid)
    return machine_owner is not None and machine_owner.uuid == user.uuid


def check_machine_access(machine_uuid: UUID, user: AnyUser) -> bool:
    if is_admin(user):
        return check_machine_ownership(machine_uuid, user)
    if is_client(user):
        assigned_clients = get_clients_assigned_to_machine(machine_uuid)
        return user.uuid in assigned_clients
    return False

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_existence
def check_machine_existence(uuid: UUID) -> bool:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return libvirt_readonly_connection.lookupByUUID(uuid.bytes) is not None
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_membership
def check_machine_membership(machine_uuid: UUID) -> bool:
    query_uuid_in_db = select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE machine_uuid = %s", (machine_uuid, ))
    
    if not query_uuid_in_db:
        logger.debug(f"Machine {machine_uuid} not found in the database. Not a member!")
        return False
    
    machine_uuid_in_db = query_uuid_in_db[0]
    logger.debug(f"machine_uuid_in_db: {machine_uuid_in_db}")
    
    return machine_uuid == machine_uuid_in_db


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_element_from_machine_xml
def get_element_from_machine_xml(machine: libvirt.virDomain, *tags: str) -> Optional[ElementTree.Element]:
    root = ElementTree.fromstring(machine.XMLDesc())
    element = root
    
    for tag in tags:
        element = element.find(tag, XML_NAME_SCHEMA)
        if element is None:
            return None
        
    return element


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_element_from_machine_xml_as_text
def get_element_from_machine_xml_as_text(machine: libvirt.virDomain, *tags: str) -> Optional[str]:
    element = get_element_from_machine_xml(machine, *tags)
    return element.text if element is not None else None
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_data
def get_machine_data(machine_uuid: UUID) -> MachineData:
    with LibvirtConnection("ro") as libvirt_connection:
        machine = parse_machine_xml(libvirt_connection.lookupByUUID(machine_uuid.bytes).XMLDesc())
    
    machine_disks = [StaticDiskInfo(system=True, name=machine.system_disk.name, size_bytes=machine.system_disk.size, type=machine.system_disk.type)]
    
    if machine.additional_disks:
        machine_disks.extend(StaticDiskInfo(system=False, name=disk.name, size_bytes=disk.size, type=disk.type) for disk in machine.additional_disks)
    
    return MachineData(
        uuid = machine_uuid,
        title = machine.title,
        tags = [machine_metadata.value for machine_metadata in machine.metadata] if machine.metadata is not None else None,
        description = machine.description,
        owner = get_machine_owner(machine_uuid),
        assigned_clients = get_clients_assigned_to_machine(machine_uuid),
        ras_port = int(machine.framebuffer.port) if machine.framebuffer.port else None,
        disks = machine_disks,
        connections = get_machine_connections(machine_uuid)
    )
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_data_by_uuid
def get_machine_data_by_uuid(uuid: UUID) -> MachineData | None:
    if not check_machine_membership(uuid):
        raise HTTPException(status_code=500, detail="Requested data of a machine that is not managed by Cherry VM Studio.")
    
    return get_machine_data(uuid)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_all_machines
def get_all_machines_data() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machines = libvirt_readonly_connection.listAllDomains(0)
        
    managed_machines = {}
    
    for machine in machines:
        machine_uuid = UUID(machine.UUIDString())
        if check_machine_membership(machine_uuid):
            managed_machines[machine_uuid] = get_machine_data(machine_uuid)
                
        return managed_machines
    
    raise HTTPException(status_code=503, detail="API could not connect to Libvirt service.")

            
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_machines
def get_user_machines_data(user: AnyUser) -> dict[UUID, MachineData]:
    user_machines = {}
    
    machine_uuids = get_user_machine_uuids(user)
    
    for machine_uuid in machine_uuids:
        machine = get_machine_data_by_uuid(machine_uuid)
        if machine is not None:
            user_machines.update({machine_uuid: machine})
            
    return user_machines


def get_active_connections(machine_uuid: UUID) -> list[UUID]:
    
    # Either <machine_uuid>_rdp or <machine_uuid>_vnc
    regex_pattern = f"^{machine_uuid}_(vnc|rdp)$"
    
    select_connected_uuids = """
        SELECT DISTINCT gch.username 
        FROM guacamole_connection_history gch
        JOIN guacamole_connection gc ON gch.connection_id = gc.connection_id
        WHERE gc.connection_name ~ %s
        AND gch.end_date IS NULL;
    """
    
    connected_uuids = select_single_field("username", select_connected_uuids, (regex_pattern, ))
   
    return connected_uuids


def get_machine_boot_timestamp(machine_uuid: UUID) -> datetime | None:
    select_machine_boot_timestamp = """
        SELECT started_at FROM deployed_machines_owners WHERE machine_uuid = %s;
    """
    
    boot_timestamp = select_single_field("started_at", select_machine_boot_timestamp, (machine_uuid,))[0]

    if boot_timestamp is not None:
        return datetime.fromisoformat(str(boot_timestamp))
    
    return None


def get_machine_connections(machine_uuid: UUID) -> dict[Literal["ssh", "rdp", "vnc"], str]:
    
    regex_pattern = f"^{machine_uuid}_.*$"
    
    select_connection = """
        SELECT protocol FROM guacamole_connection WHERE connection_name ~ %s
    """
    
    available_protocols = select_single_field("protocol", select_connection, (regex_pattern,))

    connections: dict[Literal["ssh", "rdp", "vnc"], str] = {}
    
    for protocol in available_protocols:
        connections[protocol] = f"https://session.{ENV_CONFIG.DOMAIN_NAME}/{protocol}/{machine_uuid}"
        
    return connections
 
 
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_state
def get_machine_state(machine_uuid: UUID) -> MachineState:
    with LibvirtConnection("ro") as libvirt_connection:
        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
        
    machine_parameters = parse_machine_xml(machine.XMLDesc())
    
    is_active: bool = machine.state()[0] == libvirt.VIR_DOMAIN_RUNNING
    
    if machine_parameters.system_disk.uuid is None:
        raise Exception("Supplied an inprocessable MachineDisk model without a valid UUID!")
    
    machine_disks = [DynamicDiskInfo(system=True, name=machine_parameters.system_disk.name, size_bytes=machine_parameters.system_disk.size, type=machine_parameters.system_disk.type, occupied_bytes=0)]
    
    if machine_parameters.additional_disks:
        for disk in machine_parameters.additional_disks:
            if disk.uuid is None:
                raise Exception("Supplied an inprocessable MachineDisk model without a valid UUID!")
        
        machine_disks.extend(
            DynamicDiskInfo(
                system=False, 
                name=disk.name, 
                size_bytes=disk.size, 
                type=disk.type, 
                occupied_bytes=0
            ) for disk in machine_parameters.additional_disks
        )
    
    return MachineState.model_validate({
        **get_machine_data(machine_uuid).model_dump(exclude={"disks"}),
        'active': is_active,
        'loading': is_vm_loading(machine.UUID()),
        'active_connections': get_active_connections(machine_uuid),
        'vcpu': (machine.info()[3]),
        'ram_max': (machine.info()[1]/1024),
        'ram_used': (machine.info()[2]/1024) if is_active else 0,
        'boot_timestamp': get_machine_boot_timestamp(machine_uuid),
        'disks': machine_disks
    })
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_states_by_uuids
def get_machine_states_by_uuids(machine_uuids: set[UUID] | list[UUID]) -> dict[UUID, MachineState]:  
    machine_states = dict()
    
    for machine_uuid in machine_uuids.copy():
        if check_machine_existence(machine_uuid):
            state = None
            try:
                state = get_machine_state(machine_uuid)
            except Exception as e:
                logger.error(f"Exception occured when fetching machine state in get_machine_states_by_uuid function for machine with uuid={machine_uuid}")
                logger.debug(pprint(e))
                
            machine_states[machine_uuid] = state    
            
    return machine_states
    
def get_machine_states_by_user(user: AnyUser) -> dict[UUID, MachineState]:
    machine_uuids = get_user_machine_uuids(user)
    return get_machine_states_by_uuids(machine_uuids)
    
    
def get_all_machine_states() -> dict[UUID, MachineState]:
    machine_uuids = get_all_machine_uuids()
    return get_machine_states_by_uuids(machine_uuids)