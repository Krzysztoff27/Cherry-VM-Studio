import xml.etree.ElementTree as ET
from uuid import UUID
from application.machines.models import MachineData
from application.libvirt import LibvirtConnection
from application.users.models import AdministratorInDB, ClientInDB
from application.postgresql import select_schema_dict, select_schema_one, select_single_field

###############################
#  DB manipulation functions
###############################
def get_machine_owner(machine_uuid: UUID) -> AdministratorInDB | None:
    return select_schema_one(AdministratorInDB, """
        SELECT administrators.* FROM administrators
        RIGHT JOIN deployed_machines_owners ON administrators.uuid = deployed_machines_owners.owner_uuid
        WHERE deployed_machines_owners.machine_uuid = %s
    """, (machine_uuid,))
    
    
def get_clients_assigned_to_machine(machine_uuid: UUID) -> dict[UUID, ClientInDB]:
    return select_schema_dict(ClientInDB, "uuid", """
        SELECT clients.* FROM clients
        RIGHT JOIN deployed_machines_clients ON clients.uuid = deployed_machines_clients.client_uuid
        WHERE deployed_machines_clients.machine_uuid = %s
    """, (machine_uuid,))
    
def get_user_machine_uuids(owner_uuid: UUID) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE owner_uuid = %s", (owner_uuid,))

def check_machine_ownership(machine_uuid: UUID, user_uuid: UUID):
    machine_owner = get_machine_owner(machine_uuid)
    return machine_owner is not None and machine_owner.uuid == user_uuid

###############################
#       MachineData
###############################
def get_machine_data(machine) -> MachineData:
    NS = {"vm": "http://example.com/virtualization"} 
    return MachineData (
                uuid=UUID(machine.UUIDString()), 
                group=(ET.fromstring(machine.XMLDesc()).find("metadata/vm:info", NS).find("vm:group", NS).text),
                group_member_id=int(ET.fromstring(machine.XMLDesc()).find("metadata/vm:info", NS).find("vm:groupMemberId", NS).text), 
                owner=get_machine_owner(UUID(machine.UUIDString())),
                assigned_clients=get_clients_assigned_to_machine(UUID(machine.UUIDString())),
                port=int(ET.fromstring(machine.XMLDesc()).find("devices/graphics[@type='vnc']").get("port")),
                domain=str("") #To be changed when VM connection proxying is finally done - SQL GET from the Guacamole db
        )

def get_all_machines() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machines = libvirt_readonly_connection.listAllDomains(0)
        return {UUID(machine.UUIDString()): get_machine_data(machine) for machine in machines}
            
def get_user_machines(owner_uuid: UUID) -> dict[UUID, MachineData]:
    return {machine_uuid: get_machine(machine_uuid) for machine_uuid in get_user_machine_uuids(owner_uuid)}
        
def get_machine(uuid: UUID) -> MachineData | None:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machine = libvirt_readonly_connection.lookupByUUIDString(str(uuid))
        if not machine:
            return None
        return get_machine_data(machine)