from uuid import UUID

from application.users.models import AdministratorInDB, ClientInDB
from application.postgresql import select_schema_dict, select_schema_one

def get_machines_owner(machine_uuid) -> AdministratorInDB | None:
    return select_schema_one(AdministratorInDB, """
        SELECT administrators.* FROM administrators
        RIGHT JOIN deployed_machines_owners ON administrators.uuid = deployed_machines_owners.owner_uuid
        WHERE deployed_machines_owners.machine_uuid = %s
    """, (machine_uuid,))
    
    
def get_clients_assigned_to_machine(machine_uuid) -> dict[UUID, ClientInDB]:
    return select_schema_dict(ClientInDB, "uuid", """
        SELECT clients.* FROM clients
        RIGHT JOIN deployed_machines_clients ON clients.uuid = deployed_machines_clients.client_uuid
        WHERE deployed_machines_clients.machine_uuid = %s
    """, (machine_uuid,))
    

    
        