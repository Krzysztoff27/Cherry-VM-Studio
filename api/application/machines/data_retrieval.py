from typing import Optional
from xml.etree import ElementTree
import libvirt
from fastapi import HTTPException
from uuid import UUID
from application.machines.state_management import is_vm_loading
from application.machines.models import MachineData, MachineState
from application.libvirt_socket import LibvirtConnection
from application.users.models import AdministratorInDB, ClientInDB
from application.postgresql import select_schema_dict, select_schema_one, select_single_field, select_one

XML_NAME_SCHEMA = {"vm": "http://example.com/virtualization"} 


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
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_machine_uuids
def get_user_machine_uuids(owner_uuid: UUID) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE owner_uuid = %s", (owner_uuid,))


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_ownership
def check_machine_ownership(machine_uuid: UUID, user_uuid: UUID) -> bool:
    machine_owner = get_machine_owner(machine_uuid)
    return machine_owner is not None and machine_owner.uuid == user_uuid


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
        group = get_element_from_machine_xml_as_text(machine, "metadata/vm:info", "vm:group"),
        group_member_id = int(get_element_from_machine_xml_as_text(machine, "metadata/vm:info", "vm:groupMemberId") or 0), 
        assigned_clients = get_clients_assigned_to_machine(UUID(machine.UUIDString())),
        port = port,
        domain = "" #To be changed when VM connection proxying is finally done - SQL GET from the Guacamole db
    )


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_machine_data_by_uuid
def get_machine_data_by_uuid(uuid: UUID) -> MachineData | None:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machine = libvirt_readonly_connection.lookupByUUIDString(str(uuid))
        if not machine:
            return None
        return get_machine_data(machine)
    raise HTTPException(status_code=503, detail="API could not connect to the VM service.")


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_all_machines
def get_all_machines() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machines = libvirt_readonly_connection.listAllDomains(0)
        return {UUID(machine.UUIDString()): get_machine_data(machine) for machine in machines}
    raise HTTPException(status_code=503, detail="API could not connect to the VM service.")

            
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_machines
def get_user_machines(owner_uuid: UUID) -> dict[UUID, MachineData]:
    user_machines = {}
    
    for machine_uuid in get_user_machine_uuids(owner_uuid):
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
        'ram_max': (machine.info()[2]/1024),
        'ram_used': (machine.info()[1]/1024) if is_active else 0,
        'uptime': 0
    })
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#fetch_machine_state
def fetch_machine_state(machine_uuids: list[UUID]) -> dict[UUID, MachineState]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return {machine_uuid: state for machine_uuid in machine_uuids if (state := get_machine_state(libvirt_readonly_connection.lookupByUUIDString(str(machine_uuid)))) is not None} 
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#check_machine_existence
def check_machine_existence(uuid: UUID) -> bool:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return libvirt_readonly_connection.lookupByUUIDString(str(uuid)) is not None