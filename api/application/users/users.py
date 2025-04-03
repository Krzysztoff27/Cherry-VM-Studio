import re
from typing import Literal
from fastapi import HTTPException
from utils.file import JSONHandler
from config import FILES_CONFIG, REGEX_CONFIG
from application.authentication.passwords import hash_password
from application.postgresql import select_schema, select_schema_dict, select_schema_one
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

def get_roles() -> dict[str, Role]:
    return select_schema_dict(Role, "uuid", "SELECT * FROM roles")

def get_groups() -> dict[str, Group]:
    return select_schema_dict(Group, "uuid", "SELECT * FROM groups")

def get_administrators() -> dict[str, Administrator]:
    administrators_in_db = select_schema_dict(AdministratorInDB, "uuid", "SELECT * FROM administrators")
    administrator_roles = select_schema(AdministratorsRoles, "SELECT * FROM administrators_roles")
        
    administrators : dict[str, Administrator] = {}
    roles = get_roles()
    
    for uuid, administrator in administrators_in_db.items():
        administrators[uuid] = Administrator(**administrator.model_dump(), account_type="administrative")
    
    for administrator_uuid, role_uuid in administrator_roles:
        administrators[administrator_uuid].roles.append(roles[role_uuid])
        administrators[administrator_uuid].permissions |= roles[role_uuid].permissions
        
    return administrators
    
def get_clients() -> dict[str, Client]:
    clients_in_db = select_schema_dict(ClientInDB, "uuid", "SELECT * FROM clients")
    client_roles = select_schema(ClientsGroups, "SELECT * FROM clients_groups")
        
    clients : dict[str, Client] = {}
    groups = get_groups()
    
    for uuid, client in clients_in_db.items():
        clients[uuid] = Client(**client.model_dump(), account_type="administrative")
    
    for client_uuid, role_uuid in client_roles:
        clients[client_uuid].groups.append(groups[role_uuid])
        
    return clients   

def get_all_users() -> dict[str, Administrator | Client]:
    return get_administrators() | get_clients()

def get_user_with_condition(sql_where: str, params: tuple | list | None = None) -> AnyUser | None:
    administrator = select_schema_one(Administrator, f"SELECT * FROM administrators WHERE {sql_where}", params)
    if administrator: 
        return administrator
    return select_schema_one(Client, f"SELECT * FROM clients WHERE {sql_where}", params)

def get_user_by_username(username: str) -> AnyUser | None:
    return get_user_with_condition("username = (%s)", (username,))

def get_user_by_email(email: str) -> AnyUser | None:
    return get_user_with_condition("email = (%s)", (email,))

def get_user_by_uuid(uuid: str) -> AnyUser | None:
    return get_user_with_condition("uuid = (%s)", (uuid,))

def get_filtered_users(filters: Filters):
    pass
    # if not filters.account_type:
    #     all_users = get_all_users()
    # elif filters.account_type == 'administrative':
    #     all_users = get_administrators()
    # elif filters.account_type == 'client':
    #     all_users = get_clients()
        
    # users = all_users.copy()
    
    # for key, user in all_users.items():
    #     if filters.group and ((not is_client(user)) or (not user.groups) or (filters.group not in user.groups)):
    #         del users[key]
    # return users

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
    
    