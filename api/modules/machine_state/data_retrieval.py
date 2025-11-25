import logging
from typing import Optional
from xml.etree import ElementTree
from api.modules.users.permissions import is_admin, is_client
import libvirt
from fastapi import HTTPException
from uuid import UUID
from modules.machine_state.state_management import is_vm_loading
from modules.machine_state.models import MachineData, MachineState
from modules.libvirt_socket import LibvirtConnection
from modules.users.models import AdministratorInDB, AnyUser, ClientInDB
from modules.postgresql import select_schema_dict, select_schema_one, select_single_field, select_one

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
def get_owner_machine_uuids(owner_uuid: UUID) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE owner_uuid = %s", (owner_uuid,))

def get_client_machine_uuids(client_uuid: UUID) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_clients WHERE client_uuid = %s", (client_uuid,))
    

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
def get_machine_data(machine: libvirt.virDomain) -> MachineData:
    machine_uuid = UUID(machine.UUIDString())
    
    graphics_element = get_element_from_machine_xml(machine, "devices/graphics[@type='vnc']")
    port = int(graphics_element.get("port", "-1") if graphics_element is not None else -1)
    
    return MachineData (
        uuid = machine_uuid, 
        owner= get_machine_owner(machine_uuid),
        assigned_clients = get_clients_assigned_to_machine(UUID(machine.UUIDString())),
        port = port,
        domain = "" #To be changed when VM connection proxying is finally done - SQL GET from the Guacamole db
    )

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_membership
def check_machine_membership(machine_uuid: UUID) -> bool:
    query_uuid_in_db = select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE machine_uuid = %s", (machine_uuid, ))
    
    if not query_uuid_in_db:
        logger.debug(f"Machine {machine_uuid} not found in the database. Not a member!")
        return False
    
    machine_uuid_in_db = query_uuid_in_db[0]
    logger.debug(f"machine_uuid_in_db: {machine_uuid_in_db}")
    
    return machine_uuid == machine_uuid_in_db
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_data_by_uuid
def get_machine_data_by_uuid(uuid: UUID) -> MachineData | None:
    if not check_machine_membership(uuid):
        raise HTTPException(status_code=500, detail="Requested data of a machine that is not managed by Cherry VM Studio.")
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machine = libvirt_readonly_connection.lookupByUUID(uuid.bytes)
        if not machine:
            return None
        return get_machine_data(machine)
    raise HTTPException(status_code=503, detail="API could not connect to the VM service.")


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_all_machines
def get_all_machines() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machines = libvirt_readonly_connection.listAllDomains(0)
        
        managed_machines = {}
        
        for machine in machines:
            machine_uuid = UUID(machine.UUIDString())
            if check_machine_membership(machine_uuid):
                managed_machines[machine_uuid] = get_machine_data(machine)
                
        return managed_machines
    
    raise HTTPException(status_code=503, detail="API could not connect to the VM service.")

            
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_machines
def get_user_machines(user: AnyUser) -> dict[UUID, MachineData]:
    user_machines = {}
    
    machine_uuids = []
    if is_admin(user): 
        machine_uuids = get_owner_machine_uuids(user.uuid)
    elif is_client(user): 
        machine_uuids = get_client_machine_uuids(user.uuid)
    
    for machine_uuid in machine_uuids:
        machine = get_machine_data_by_uuid(machine_uuid)
        if machine is not None:
            user_machines.update({machine_uuid: machine})
            
    return user_machines
        

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_state
def get_machine_state(machine: libvirt.virDomain) -> MachineState:
    is_active: bool = machine.state()[0] == libvirt.VIR_DOMAIN_RUNNING
    
    return MachineState.model_validate ({
        **get_machine_data(machine).model_dump(),
        'active': is_active,
        'loading': is_vm_loading(machine.UUID()),
        'active_connections': [],
        'ram_max': (machine.info()[1]/1024),
        'ram_used': (machine.info()[2]/1024) if is_active else 0,
        'uptime': 0
    })
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_states_by_uuids
def get_machine_states_by_uuids(machine_uuids: set[UUID] | list[UUID]) -> dict[UUID, MachineState]:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machine_states = dict()
        
        for machine_uuid in machine_uuids.copy():
            machine = libvirt_readonly_connection.lookupByUUID(machine_uuid.bytes)
            if machine is not None:
                state = None
                try:
                    state = get_machine_state(machine)
                except Exception:
                    logger.error(
                        f"Exception occured when fetching machine state in get_machine_states_by_uuid function for machine with uuid={machine_uuid}"
                    )
                
                machine_states[machine_uuid] = state    
                
            
        return machine_states
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_existence
def check_machine_existence(uuid: UUID) -> bool:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return libvirt_readonly_connection.lookupByUUID(uuid.bytes) is not None