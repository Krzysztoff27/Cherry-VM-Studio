from fastapi import HTTPException
from utils.file import JSONHandler
from config import FILES_CONFIG
from .models import UserInDB, User, Filters

#
# to be replaced with SQL queries
#

users_database = JSONHandler(FILES_CONFIG.users)

def delete_user_by_uuid(uuid: str):
    users = users_database.read()
    if uuid in users:
        del users[uuid]
        users_database.write(users)