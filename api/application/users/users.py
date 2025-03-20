import re
from fastapi import HTTPException
from utils.file import JSONHandler
from config import FILES_CONFIG, REGEX_CONFIG
from application.authentication.passwords import hash_password
from .permissions import is_admin, is_client
from .models import AdministratorInDB, ClientInDB, CreateUserForm, AnyUserInDB, Filters, UserModificationForm
from .groups import add_user_to_group, remove_user_from_group

#
# to be replaced with SQL queries
#

administrators_database = JSONHandler(FILES_CONFIG.administrators)
clients_database = JSONHandler(FILES_CONFIG.clients)

def get_administrators() -> dict[str, AdministratorInDB]:
    return {uuid: AdministratorInDB(**user) for uuid, user in administrators_database.read().items()}

def get_clients() -> dict[str, ClientInDB]:
    return {uuid: ClientInDB(**user) for uuid, user in clients_database.read().items()}

def get_all_users() -> dict[str, AdministratorInDB | ClientInDB]:
    return get_administrators() | get_clients()

def get_user_by_username(username: str) -> AnyUserInDB | None:
    users = get_all_users()
    for user in users.values():
        if user.username == username:
            return user

def get_user_by_email(email: str) -> AnyUserInDB | None:
    users = get_all_users()
    for user in users.values():
        if user.email == email:
            return user

def get_user_by_uuid(uuid: str) -> AnyUserInDB | None:
    users = get_all_users()
    if uuid in users:
        return users[uuid]

# CANT WAIT FOR THIS TO BE TURNED INTO SQL... I HATE THIS
def get_filtered_users(filters: Filters):
    if not filters.account_type:
        all_users = get_all_users()
    elif filters.account_type == 'administrative':
        all_users = get_administrators()
    elif filters.account_type == 'client':
        all_users = get_clients()
        
    users = all_users.copy()
    
    for key, user in all_users.items():
        if filters.group and ((not is_client(user)) or (not user.groups) or (filters.group not in user.groups)):
            del users[key]
    return users

def delete_user_by_uuid(uuid: str):
    administrators = administrators_database.read()
    clients = clients_database.read()
    
    if uuid in administrators:
        del administrators[uuid]
        administrators_database.write(administrators)
        
    elif uuid in clients:
        for group_uuid in clients[uuid].groups:
            remove_user_from_group(group_uuid, uuid)
        del clients[uuid]
        clients_database.write(clients)
        
        
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
    validate_user_details(user_data)

    user_data.username = user_data.username.lower()
    user_data.password = hash_password(user_data.password)
        
    if is_admin(user_data):
        user = AdministratorInDB(**user_data.model_dump())
        administrators = administrators_database.read()
        administrators[user_data.uuid] = user.model_dump()
        administrators_database.write(administrators)
        return user
        
    if is_client(user_data):
        user = ClientInDB(**user_data.model_dump())
        clients = clients_database.read()
        clients[user_data.uuid] = user.model_dump()
        clients_database.write(clients)
        return user

# GIVE ME SQL ALREADY WITH ITS CASCADE UPDATES PLS
def modify_user(uuid, modification_data: UserModificationForm) -> AnyUserInDB:
    user = get_user_by_uuid(uuid)   
    database = administrators_database if is_admin(user) else clients_database
    
    for key, value in modification_data.model_dump().items():
        if value is not None and hasattr(user, key):
            
            if key == 'groups':
                for group in user.groups:
                    remove_user_from_group(group, uuid)
                for group in value:
                    add_user_to_group(group, uuid)
                
            setattr(user, key, value)    
    
    users = database.read()
    users[user.uuid] = user.model_dump()
    database.write(users)
    
    return user
        
    