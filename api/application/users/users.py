import re
from typing import Literal
from uuid import UUID
from fastapi import HTTPException
from utils.file import JSONHandler
from config import FILES_CONFIG, REGEX_CONFIG
from application.authentication.passwords import hash_password
from application.postgresql import select_rows, select_schema, select_schema_dict, select_schema_one, select_single_field
from .permissions import is_admin, is_client
from .models import Administrator, AdministratorInDB, AdministratorsRoles, AnyUser, Client, ClientInDB, ClientsGroups, CreateUserForm, AnyUserInDB, Filters, Group, Role, UserModificationForm
from .groups import add_user_to_group, remove_user_from_group

#
# to be replaced with SQL queries
#

def get_parent_table(user: AnyUser) -> Literal['administrators', 'clients']:
    if is_admin(user):
        return 'administrators'
    if is_client(user):
        return 'clients'

def get_roles() -> dict[UUID, Role]:
    return select_schema_dict(Role, "uuid", "SELECT * FROM roles")

def get_groups() -> dict[UUID, Group]:
    return select_schema_dict(Group, "uuid", "SELECT * FROM groups")

def get_administrators() -> dict[UUID, Administrator]:
    administrators = select_schema_dict(Administrator, "uuid", "SELECT * FROM administrators")
    administrator_roles = select_schema(AdministratorsRoles, "SELECT * FROM administrators_roles")
    roles = get_roles()
    
    for link in administrator_roles:
        administrators[link.administrator_uuid].roles.append(roles[link.role_uuid])
        administrators[link.administrator_uuid].permissions |= roles[link.role_uuid].permissions
        
    return administrators
    
def get_clients() -> dict[UUID, Client]:
    clients = select_schema_dict(Client, "uuid", "SELECT * FROM clients")
    client_roles = select_schema(ClientsGroups, "SELECT * FROM clients_groups")
    groups = get_groups()
    
    for link in client_roles:
        clients[link.client_uuid].groups.append(groups[link.group_uuid])
        
    return clients   

def get_all_users() -> dict[UUID, Administrator | Client]:
    return get_administrators() | get_clients()

def get_user_by_field(field_name: str, value: str) -> AnyUser | None:
    administrator = select_schema_one(Administrator, f"SELECT * FROM administrators WHERE administrators.{field_name} = (%s)", (value,))
    if administrator: 
        roles = select_schema(Role, 
           f"SELECT roles.* FROM roles "
           f"JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid "
           f"JOIN administrators ON administrators_roles.administrator_uuid = administrators.uuid "
           f"WHERE administrators.{field_name} = (%s)", (value,)                                                      
        )
        
        for role in roles:
            administrator.roles.append(Role.model_validate(role))
        return administrator
        
    client = select_schema_one(Client, f"SELECT * FROM clients WHERE clients.{field_name} = (%s)", (value,))
    groups = select_schema(Group, 
        f"SELECT groups.* FROM groups "
        f"JOIN clients_groups ON groups.uuid = clients_groups.group_uuid "
        f"JOIN clients ON clients_groups.client_uuid = clients.uuid "
        f"WHERE clients.{field_name} = (%s)", (value,)                                                        
    )
    
    for group in groups:
        client.groups.append(Group.model_validate(group))
    return client
    

def get_user_by_username(username: str) -> AnyUser | None:
    return get_user_by_field("username", username)

def get_user_by_email(email: str) -> AnyUser | None:
    return get_user_by_field("email", email)

def get_user_by_uuid(uuid: UUID) -> AnyUser | None:
    return get_user_by_field("uuid", uuid)

def get_filtered_users(filters: Filters):
    if not len(filters.model_dump(exclude_none=True).items()):
        return get_all_users()
    
    users = {}
    
    # get uuids of admins that pass the filters
    if (not filters.account_type or filters.account_type == 'administrative') and not filters.group:
        query = """
            SELECT DISTINCT administrators.uuid FROM administrators 
            JOIN administrators_roles ON administrators.uuid = administrators_roles.administrator_uuid
            JOIN roles ON administrators_roles.role_uuid = roles.uuid
        """
        if filters.role: query += " WHERE roles.uuid = %(role)s"
        # implement more filters for admins here if needed
        
        # role data matched to the admin uuid
        relevant_roles = select_rows(f"""
            SELECT administrators_roles.administrator_uuid, roles.* FROM roles
            JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid
            WHERE administrators_roles.administrator_uuid = ({query})
        """, {"role": filters.role})
        
        admins = select_schema_dict(Administrator, "uuid", f"SELECT * FROM administrators WHERE uuid = ({query})", {"role": filters.role})
        
        for role_data in relevant_roles:
            admins[role_data["administrator_uuid"]].roles.append(Role.model_validate(role_data))
        
        users.update(admins)
       
    # get uuids of clients that pass the filters
    if (not filters.account_type or filters.account_type == 'client') and not filters.role:
        query = """
            SELECT DISTINCT clients.uuid FROM clients
            JOIN clients_groups ON clients.uuid = clients_groups.client_uuid
            JOIN groups ON clients_groups.group_uuid = groups.uuid
        """
        if filters.group: query += " WHERE groups.uuid = %(group)s"
        # implement more filters for clients here if needed
        
        # group data matched to the client uuid
        relevant_groups = select_rows(f"""
            SELECT clients_groups.client_uuid, groups.* FROM groups
            JOIN clients_groups ON groups.uuid = clients_groups.group_uuid
            WHERE clients_groups.client_uuid = ({query})
        """, {"group": filters.group})
        
        clients = select_schema_dict(Client, "uuid", f"SELECT * FROM clients WHERE uuid = ({query})", {"group": filters.group})
        
        for group_data in relevant_groups:
            clients[group_data["client_uuid"]].groups.append(Group.model_validate(group_data))
        
        users.update(clients)
    
    return users

def delete_user_by_uuid(uuid: str):
    pass
    # administrators = administrators_database.read()
    # clients = clients_database.read()
    
    # if uuid in administrators:
    #     del administrators[uuid]
    #     administrators_database.write(administrators)
        
    # elif uuid in clients:
    #     for group_uuid in clients[uuid].groups:
    #         remove_user_from_group(group_uuid, uuid)
    #     del clients[uuid]
    #     clients_database.write(clients)
        
        
def validate_user_details(user_data: CreateUserForm):    
    if get_user_by_username(user_data.username) is not None:
        raise HTTPException(status_code=409, detail="User with this username already exists.")
    
    if get_user_by_email(user_data.email) is not None:
        raise HTTPException(status_code=409, detail="User with this email already exists.")
    
    if not re.match(REGEX_CONFIG.username, user_data.username):
        raise HTTPException(status_code=400, detail="Invalid username. Username must be between 3 and 24 characters in length, start with a letter and only contain alphanumeric characters, underscores, hyphens and periods.")
    
    if not re.match(REGEX_CONFIG.password, user_data.password):
        raise HTTPException(status_code=400, detail="Invalid password. Password must be at least 12 characters long and contain at least one digit, lowercase letter, upercase letter and one of the special characters.")
    
    if len(user_data.name) > 50:
        raise HTTPException(status_code=400, detail="Name field cannot contain more than 50 characters.")
    
    if len(user_data.surname) > 50:
        raise HTTPException(status_code=400, detail="Surname field cannot contain more than 50 characters.")
        
def create_user(user_data: CreateUserForm) -> AdministratorInDB | ClientInDB:
    pass
    # validate_user_details(user_data)

    # user_data.username = user_data.username.lower()
    # user_data.password = hash_password(user_data.password)
        
    # if is_admin(user_data):
    #     user = AdministratorInDB(**user_data.model_dump())
    # if is_client(user_data):
    #     user = ClientInDB(**user_data.model_dump())
        
    # users = get_parent_database(user).read()
    # users[user_data.uuid] = user.model_dump()
    # users.write(users)
    # return user

def modify_user(uuid, modification_data: UserModificationForm) -> AnyUserInDB:
    pass
    # user = get_user_by_uuid(uuid) 
    
    # for key, value in modification_data.model_dump().items():
    #     if value is not None and hasattr(user, key):
            
    #         if key == 'groups':
    #             for group in user.groups:
    #                 remove_user_from_group(group, uuid)
    #             for group in value:
    #                 add_user_to_group(group, uuid)
                
    #         setattr(user, key, value)    
    
    # database = get_parent_database(user)
    # users = database.read()
    # users[user.uuid] = user.model_dump()
    # database.write(users)
    
    # return user
        
def change_user_password(uuid, new_password):
    pass
    
    # if not re.match(REGEX_CONFIG.password, new_password):
    #     raise HTTPException(status_code=400, detail="Invalid password. Password must be at least 12 characters long and contain at least one digit, lowercase letter, upercase letter and one of the special characters.")
    
    # user = get_user_by_uuid(uuid)   
    # database = get_parent_database(user)
    
    # users = database.read()
    # users[user.uuid]["password"] = hash_password(new_password)
    # database.write(users)
    
    