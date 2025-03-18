import re
from fastapi import HTTPException
from utils.file import JSONHandler
from config import FILES_CONFIG, REGEX_CONFIG
from application.authentication.passwords import hash_password
from .models import Administrator, Client, UserInDB, Filters, CreatedUser, UserModificationData

#
# to be replaced with SQL queries
#

users_database = JSONHandler(FILES_CONFIG.users)

def get_user_by_username(username: str) -> UserInDB | None:
    users = users_database.read()
    return next((UserInDB(**user) for user in users.values() if user["username"] == username), None)

def get_user_by_email(email: str) -> UserInDB | None:
    users = users_database.read()
    return next((UserInDB(**user) for user in users.values() if user["email"] == email), None)

def get_user_by_uuid(uuid: str) -> UserInDB | None:
    users = users_database.read()
    if uuid in users:
        return UserInDB(**users[uuid])
    
def get_all_users() -> dict[str, UserInDB]:
    users = users_database.read()
    if not users: 
        return {}
    return {key: UserInDB(**user) for key, user in users.items()}

def get_filtered_users(filters: Filters):
    all_users = get_all_users()
    users = all_users.copy()
    for key, user in all_users.items():
        if filters.account_type and filters.account_type != user.account_type:
            del users[key]
        if filters.group and ((not user.groups) or (filters.group not in user.groups)):
            del users[key]
    return users

def delete_user_by_uuid(uuid: str):
    users = users_database.read()
    if uuid in users:
        del users[uuid]
        users_database.write(users)
        
def validate_user_details(user_data: CreatedUser):
    
    if user_data.account_type != 'administrative' and user_data.account_type != 'client':
        HTTPException(status_code=400, detail="Invalid account type.")
    
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
        
def create_user(user_data: CreatedUser) -> UserInDB:
    validate_user_details(user_data)
        
    users = users_database.read() 
    
    UserClass = Administrator if user_data.account_type == 'administrative' else Client
    base_user = UserClass(**user_data.model_dump())
    base_user.username = base_user.username.lower()
    
    user = UserInDB(**base_user.model_dump(), password=hash_password(user_data.password))
    
    users[user.uuid] = user.model_dump()
    users_database.write(users)
    
    return user

def modify_user(modification_data: UserModificationData):
    pass