from uuid import UUID
from fastapi import HTTPException
from application.postgresql import select_rows, select_schema, select_schema_dict, select_schema_one, pool
from application.users.models import ClientInDB, CreatedGroup, Group
from utils.file import JSONHandler
from config.files_config import FILES_CONFIG

groups_database = JSONHandler(FILES_CONFIG.groups)
clients_database = JSONHandler(FILES_CONFIG.clients)

def get_group_by_field(field_name: str, value: str) -> Group | None:
    group = select_schema_one(Group, f"SELECT * FROM groups WHERE {field_name} = %s", (value,))
    
    if group:
        group.users = select_schema(ClientInDB, f"""
            SELECT clients.* FROM clients 
            JOIN clients_groups ON clients.uuid = clients_groups.client_uuid
            JOIN groups ON clients_groups.group_uuid = groups.uuid
            WHERE groups.{field_name} = %s
        """, (value, ))
        
    return group

def get_group_by_name(name: str) -> Group | None:
    return get_group_by_field("name", name)

def get_group_by_uuid(uuid: str) -> Group | None:
    return get_group_by_field("uuid", uuid)

def get_all_groups() -> dict[UUID, Group]:
    groups = select_schema_dict(Group, "uuid", "SELECT * FROM groups")
    
    clients_linked_to_groups = select_rows("""
        SELECT clients.*, group_uuid FROM clients_groups
        LEFT JOIN clients ON clients_groups.client_uuid = clients.uuid                                    
    """)
    
    for link_data in clients_linked_to_groups:
        groups[link_data["group_uuid"]].users.append(ClientInDB.model_validate(link_data))
    
    return groups

def delete_group_by_uuid(uuid: str):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM groups WHERE uuid = %s", (uuid,))
            connection.commit()

def create_group(group_data: CreatedGroup) -> Group:
    if get_group_by_name(group_data.name) is not None:
        raise HTTPException(status_code=409, detail="Group with this name already exists")
    
    if len(group_data.name) > 50:
        raise HTTPException(status_code=400, detail="Name field cannot contain more than 50 characters.") 
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                cursor.execute("INSERT INTO groups (uuid, name) VALUES (%s, %s)", (group_data.uuid, group_data.name))
                
                for user_uuid in group_data.users:
                    cursor.execute("SELECT * FROM clients WHERE uuid = %s", (user_uuid,))
                    row = cursor.fetchone()
                    if not row:
                        raise HTTPException(400, f"Client with uuid={user_uuid} does not exist.")
                    cursor.execute("INSERT INTO clients_groups (client_uuid, group_uuid) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_uuid, group_data.uuid))
    return get_group_by_uuid(group_data.uuid)            
            

def join_user_to_group(group_uuid, client_uuid) -> None:
    group = get_group_by_uuid(group_uuid)
    client = select_schema_one(ClientInDB, "SELECT * FROM clients WHERE uuid = %s", (client_uuid,))
    
    if not group:
        raise HTTPException(400, f"Group with uuid={group_uuid} does not exist.")
    if not client:
        raise HTTPException(400, f"Client with uuid={client_uuid} does not exist.")

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO clients_groups (client_uuid, group_uuid) VALUES (%s, %s) ON CONFLICT DO NOTHING", (client_uuid, group_uuid))
            connection.commit()

    
def remove_user_from_group(group_uuid, client_uuid) -> None:
    group = get_group_by_uuid(group_uuid)
    client = select_schema_one(ClientInDB, "SELECT * FROM clients WHERE uuid = %s", (client_uuid,))
    
    if not group:
        raise HTTPException(400, f"Group with uuid={group_uuid} does not exist.")
    if not client:
        raise HTTPException(400, f"Client with uuid={client_uuid} does not exist.")
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM clients_groups WHERE client_uuid = %s AND group_uuid = %s", (client_uuid, group_uuid))
            connection.commit()

    