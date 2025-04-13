import xml.etree.ElementTree as ET
from uuid import UUID
from application.machines.models import MachineData
from application.libvirt import LibvirtConnection
from application.users.models import AdministratorInDB, ClientInDB
from application.postgresql import select_schema_dict, select_schema_one, select_single_field

def get_machines_owner(machine_uuid: UUID) -> AdministratorInDB | None:
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

def get_machine_data(machine) -> MachineData:
    return {
            MachineData(
                uuid=UUID(machine.UUIDString()), 
                group=(ET.fromstring(machine.XMLDesc()).find("metadata/group") or {}).get("text", None),
                group_member_id=int((ET.fromstring(machine.XMLDesc()).find("metadata/group_member_id") or {}).get("text", None)),
                owner=,
                assigned_clients=,
                port=int(ET.fromstring(machine.XMLDesc()).find("devices/graphics[@type='vnc']").get("port")),
                domain=str("") #To be changed when VM connection proxying is finally done - SQL GET from the Guacamole db
            )
        }

def get_all_machines() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machines = libvirt_readonly_connection.listAllDomains(0)
        return {UUID(machine.UUIDString()): get_machine_data(machine) for machine in machines}
            
def get_user_machines() -> dict[UUID, MachineData]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        #Implement machine fetching assigned to a certain user
        return{}
        
def get_machine(uuid: UUID) -> MachineData:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        machine = libvirt_readonly_connection.lookupByUUIDString(str(uuid))
        return {get_machine_data(machine)}




        

