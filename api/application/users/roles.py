from uuid import UUID

from fastapi import HTTPException
from psycopg import Cursor
from utils.uuid import is_valid_uuid
from application.users.permissions import verify_permission_integrity
from application.postgresql import select_rows, select_schema, select_schema_dict, select_schema_one, pool
from application.users.models import AdministratorInDB, Role, RoleInDB

def get_role_by_field(field_name: str, value: str) -> Role | None:
    role = select_schema_one(Role, f"SELECT * FROM roles WHERE {field_name} = %s", (value,))
    
    if role:
        role.users = select_schema(AdministratorInDB, f"""
            SELECT administrators.* FROM administrators 
            JOIN administrators_roles ON administrators.uuid = administrators_roles.administrator_uuid
            JOIN roles ON administrators_roles.role_uuid = roles.uuid
            WHERE roles.{field_name} = %s
        """, (value, ))
        
    return role

def get_role_by_name(name: str) -> Role | None:
    return get_role_by_field("name", name)

def get_role_by_uuid(uuid: str) -> Role | None:
    return get_role_by_field("uuid", uuid)

def get_all_roles() -> dict[UUID, Role]:
    roles = select_schema_dict(Role, "uuid", "SELECT * FROM roles")
    
    administrators_linked_to_roles = select_rows("""
        SELECT administrators.*, role_uuid FROM administrators_roles
        LEFT JOIN administrators ON administrators_roles.administrator_uuid = administrators.uuid                                    
    """)
    
    for link_data in administrators_linked_to_roles:
        roles[link_data["role_uuid"]].users.append(AdministratorInDB.model_validate(link_data))
    
    return roles
# wrapper to verify_permission_integrity
def verify_role_integrity(cursor: Cursor):
    cursor.execute("""
        SELECT DISTINCT roles.* FROM administrators_roles
        LEFT JOIN roles ON administrators_roles.role_uuid = roles.uuid
    """)
    results = cursor.fetchall()
    assigned_roles = [RoleInDB.model_validate(row) for row in results]
    return verify_permission_integrity(assigned_roles)


def update_user_roles(user_uuid: UUID, old_roles: set[UUID] | list[UUID], new_roles: set[UUID] | list[UUID]):
    old_roles = set(old_roles)
    new_roles = set(new_roles)
    
    to_leave = old_roles - new_roles
    to_join = new_roles - old_roles
    
    for role in to_leave:
        if is_valid_uuid(role):
            revoke_role_from_user(role, user_uuid)
    for role in to_join:
        if is_valid_uuid(role):
            grant_role_to_user(role, user_uuid)
        

def grant_role_to_user(role_uuid: UUID, user_uuid: UUID):
    administrator = select_schema_one(AdministratorInDB, "SELECT * FROM administrators WHERE uuid = %s", (user_uuid,))
    
    if not get_role_by_uuid(role_uuid):
        raise HTTPException(400, f"Role with UUID={role_uuid} does not exist.")
    if not administrator:
        raise HTTPException(400, f"Administrator with UUID={user_uuid} does not exist.")
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO administrators_roles (administrator_uuid, role_uuid) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_uuid, role_uuid))
            connection.commit()

            
def revoke_role_from_user(role_uuid, administrator_uuid) -> None:
    role = get_role_by_uuid(role_uuid)
    administrator = select_schema_one(AdministratorInDB, "SELECT * FROM administrators WHERE uuid = %s", (administrator_uuid,))
    
    if not role:
        raise HTTPException(400, f"Group with UUID={role_uuid} does not exist.")
    if not administrator:
        raise HTTPException(400, f"Client with UUID={administrator_uuid} does not exist.")
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM administrators_roles WHERE administrator_uuid = %s AND role_uuid = %s", (administrator_uuid, role_uuid))
            
            if verify_role_integrity(cursor):
                connection.commit()
            else: 
                connection.rollback()
                raise HTTPException(400, f"Cannot revoke role with UUID={role_uuid} from the user, as it would leave at least one permission unassigned. Please assign the affected permission to another user before proceeding.")
            