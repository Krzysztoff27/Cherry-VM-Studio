from uuid import UUID

from .models import MachineData
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

    
def get_machine(uuid) -> MachineData | None:
    return None

def get_all_machines() -> dict[UUID, MachineData]:
    return {}

    
        