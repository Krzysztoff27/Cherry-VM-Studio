import xml.etree.ElementTree as ET
from uuid import UUID
from application.machines.models import MachineData
from application.libvirt import LibvirtConnection
from application.users.models import AdministratorInDB

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

