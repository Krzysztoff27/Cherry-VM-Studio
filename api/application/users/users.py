import re
import logging
from typing import Literal
from uuid import UUID
from fastapi import HTTPException
from config.regex_config import REGEX_CONFIG
from application.users.groups import update_user_groups
from application.authentication.passwords import hash_password
from application.postgresql import select_rows, select_schema, select_schema_dict, select_schema_one, pool
from application.exceptions.models import RaisedException
from .roles import update_user_roles, verify_role_integrity
from .permissions import is_admin, is_client
from .models import *

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_parent_table
def get_parent_table(user: AnyUser) -> Literal['administrators', 'clients']:
    if is_admin(user):
        return 'administrators'
    return 'clients'


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_administrators
def get_administrators() -> dict[UUID, Administrator]:
    administrators = select_schema_dict(Administrator, "uuid", "SELECT * FROM administrators")
    administrator_roles = select_schema(AdministratorsRoles, "SELECT * FROM administrators_roles")
    roles = select_schema_dict(RoleInDB, "uuid", "SELECT * FROM roles")
    
    for link in administrator_roles:
        administrators[link.administrator_uuid].roles.append(roles[link.role_uuid])
        administrators[link.administrator_uuid].permissions |= roles[link.role_uuid].permissions
        
    return administrators
  
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_clients   
def get_clients() -> dict[UUID, Client]:
    clients = select_schema_dict(Client, "uuid", "SELECT * FROM clients")
    client_roles = select_schema(ClientsGroups, "SELECT * FROM clients_groups")
    groups = select_schema_dict(GroupInDB, "uuid", "SELECT * FROM groups")
    
    for link in client_roles:
        clients[link.client_uuid].groups.append(groups[link.group_uuid])
        
    return clients   


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_all_users
def get_all_users() -> dict[UUID, Administrator | Client]:
    return get_administrators() | get_clients()


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_administrator_by_field
def get_administrator_by_field(field_name: str, value: str) -> Administrator | None:
    administrator = select_schema_one(Administrator, f"SELECT * FROM administrators WHERE administrators.{field_name} = (%s)", (value,))
    
    if not administrator:
        return
    
    administrator.roles = select_schema(RoleInDB, 
        f"SELECT roles.* FROM roles "
        f"JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid "
        f"JOIN administrators ON administrators_roles.administrator_uuid = administrators.uuid "
        f"WHERE administrators.{field_name} = (%s)", (value,)                                                      
    )
    
    for role in administrator.roles:
        administrator.permissions |= role.permissions
        
    return administrator


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_client_by_field
def get_client_by_field(field_name: str, value: str) -> Client | None:
    client = select_schema_one(Client, f"SELECT * FROM clients WHERE clients.{field_name} = (%s)", (value,))
    
    if not client:
        return
    
    client.groups = select_schema(GroupInDB, 
        f"SELECT groups.* FROM groups "
        f"JOIN clients_groups ON groups.uuid = clients_groups.group_uuid "
        f"JOIN clients ON clients_groups.client_uuid = clients.uuid "
        f"WHERE clients.{field_name} = (%s)", (value,)                                                        
    )
    
    return client


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_by_field
def get_user_by_field(field_name: str, value: str) -> AnyUser | None:
    administrator = get_administrator_by_field(field_name, value)
    if administrator:
        return administrator
    return get_client_by_field(field_name, value)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_by_username
def get_user_by_username(username: str) -> AnyUser | None:
    return get_user_by_field("username", username)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_by_email
def get_user_by_email(email: str) -> AnyUser | None:
    return get_user_by_field("email", email)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_by_uuid
def get_user_by_uuid(uuid: UUID) -> AnyUser | None:
    return get_user_by_field("uuid", str(uuid))

def get_filtered_users(filters: Filters):
    if not len(filters.model_dump(exclude_none=True).items()):
        return get_all_users()
    
    users = {}
    
    # get uuids of admins that pass the filters
    if (not filters.account_type or filters.account_type == 'administrative') and not filters.group:
        query = """
            SELECT DISTINCT administrators.uuid FROM administrators 
            LEFT JOIN administrators_roles ON administrators.uuid = administrators_roles.administrator_uuid
            LEFT JOIN roles ON administrators_roles.role_uuid = roles.uuid
        """
        if filters.role: query += " WHERE roles.uuid = %(role)s"
        # implement more filters for admins here if needed
        
        # role data matched to the admin uuid
        relevant_roles = select_rows(f"""
            SELECT administrators_roles.administrator_uuid, roles.* FROM roles
            JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid
            WHERE administrators_roles.administrator_uuid IN ({query})
        """, {"role": filters.role})
        
        admins = select_schema_dict(Administrator, "uuid", f"SELECT * FROM administrators WHERE uuid IN ({query})", {"role": filters.role})
        
        for role_data in relevant_roles:
            admins[role_data["administrator_uuid"]].roles.append(RoleInDB.model_validate(role_data))
        
        users.update(admins)
       
    # get uuids of clients that pass the filters
    if (not filters.account_type or filters.account_type == 'client') and not filters.role:
        query = """
            SELECT DISTINCT clients.uuid FROM clients
            LEFT JOIN clients_groups ON clients.uuid = clients_groups.client_uuid
            LEFT JOIN groups ON clients_groups.group_uuid = groups.uuid
        """
        if filters.group:
            query += " WHERE groups.uuid = %(group)s"
        # implement more filters for clients here if needed
        
        # group data matched to the client uuid
        relevant_groups = select_rows(f"""
            SELECT clients_groups.client_uuid, groups.* FROM groups
            JOIN clients_groups ON groups.uuid = clients_groups.group_uuid
            WHERE clients_groups.client_uuid IN ({query})
        """, {"group": filters.group})
        
        clients = select_schema_dict(Client, "uuid", f"SELECT * FROM clients WHERE uuid IN ({query})", {"group": filters.group})
        
        for group_data in relevant_groups:
            clients[group_data["client_uuid"]].groups.append(GroupInDB.model_validate(group_data))
        
        users.update(clients)
    
    return users


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#delete_user_by_uuid
def delete_user_by_uuid(uuid: UUID):
    user = get_user_by_uuid(uuid)
    
    if not user:
        return
    
    table = get_parent_table(user)
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM {table} WHERE uuid = %s", (uuid,))
            if is_admin(user) and not verify_role_integrity(cursor):
                connection.rollback()
                raise HTTPException(400, f"Cannot remove user with UUID={uuid}, as it would leave at least one permission unassigned. Please assign the affected permission to another user before proceeding.")
            connection.commit()
    
     
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#create_user
def create_user(user_data: CreateUserForm) -> AnyUser:
    user_data.username = user_data.username.lower()
    user_data.password = hash_password(user_data.password)
    
    with pool.connection() as connection:
        with connection.cursor() as cursor: 
            with connection.transaction():
                if is_admin(user_data):
                    cursor.execute(f"""
                        INSERT INTO administrators (uuid, username, password, name, surname, email)
                        VALUES (%(uuid)s, %(username)s, %(password)s, %(name)s, %(surname)s, %(email)s)
                    """, user_data.model_dump())
                    
                    for role_uuid in user_data.roles:
                        cursor.execute(f"""
                            INSERT INTO administrators_roles (administrator_uuid, role_uuid)
                            VALUES (%(administrator_uuid)s, %(role_uuid)s)               
                        """, {"administrator_uuid": user_data.uuid, "role_uuid": role_uuid})
                        
                elif is_client(user_data):
                    cursor.execute(f"""
                        INSERT INTO clients (uuid, username, password, name, surname, email)
                        VALUES (%(uuid)s, %(username)s, %(password)s, %(name)s, %(surname)s, %(email)s)
                    """, user_data.model_dump())
                    
                    for group_uuid in user_data.groups:
                        cursor.execute(f"""
                            INSERT INTO clients_groups (client_uuid, group_uuid)
                            VALUES (%(client_uuid)s, %(group_uuid)s)               
                        """, {"client_uuid": user_data.uuid, "group_uuid": group_uuid})  
                        
        
    # we're assuming here that user will exist after being created
    # surely it won't break :)
    
    user = get_user_by_uuid(user_data.uuid)
    return user # type: ignore
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#modify_user
def modify_user(logged_in_user: AnyUser, user_uuid: UUID, modification_data: ModifyUserForm) -> AnyUser:
    user = get_user_by_uuid(user_uuid)
    
    if not user:
        raise RaisedException("User does not exist.")
    
    set_statement = ""
    if modification_data.username   is not None and modification_data.username != user.username:    set_statement += "username = %(username)s "
    if modification_data.email      is not None and modification_data.email != user.email:          set_statement += "email = %(email)s "
    if modification_data.name       is not None and modification_data.name != user.name:            set_statement += "name = %(name)s "
    if modification_data.surname    is not None and modification_data.surname != user.surname:      set_statement += "surname = %(surname)s "
            
    params = {**modification_data.model_dump(), "uuid": user_uuid}
            
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            if is_admin(user):
                if len(set_statement):
                    cursor.execute(f"UPDATE administrators SET {set_statement} WHERE uuid = %(uuid)s", params)
                
                if modification_data.roles is not None:                    
                    update_user_roles(logged_in_user, user_uuid, set(role.uuid for role in user.roles), set(modification_data.roles))
                
            elif is_client(user):
                if len(set_statement):
                    cursor.execute(f"UPDATE clients SET {set_statement} WHERE uuid = %(uuid)s", params)
                
                if modification_data.groups is not None:                    
                    update_user_groups(user_uuid, set(group.uuid for group in user.groups), set(modification_data.groups))
                
            connection.commit()
            
    # surely user still exists by now :)
    return get_user_by_uuid(user_uuid) # type: ignore
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#change_user_password
def change_user_password(uuid, new_password):
    user = get_user_by_uuid(uuid)
    
    if not user:
        raise HTTPException(status_code=400, detail="User with UUID={user_uuid} does not exist.")
    
    if not re.match(REGEX_CONFIG.password, new_password):
        raise HTTPException(status_code=400, detail="Invalid password. Password must be at least 12 characters long and contain at least one digit, lowercase letter, upercase letter and one of the special characters.") 
    
    table = get_parent_table(user)
    hashed_password = hash_password(new_password)
 
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"UPDATE {table} SET password = %s WHERE uuid = %s", (hashed_password, uuid,))
            connection.commit()
 
 
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#update_user_last_active
def update_user_last_active(user: AnyUser):
    table = get_parent_table(user)
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"UPDATE {table} SET last_active = CURRENT_TIMESTAMP WHERE uuid = %s", [user.uuid])