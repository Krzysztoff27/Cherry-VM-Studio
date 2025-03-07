from utils.file import JSONHandler
from config import FILES_CONFIG
from .models import *

users_database = JSONHandler(FILES_CONFIG.users)

def get_user_by_username(username: str) -> User | None:
    users = users_database.read()
    return next((UserInDB(**user) for user in users.values() if user["username"] == username), None)

def get_user_by_uuid(uuid: str) -> User | None:
    users = users_database.read()
    if uuid in users:
        user_dict = users[uuid]
        return UserInDB(**user_dict)
    
def get_users():
    users = users_database.read()
    if not users: 
        return None
    return {key: UserInDB(**user) for key, user in users.items()}
        
    
    