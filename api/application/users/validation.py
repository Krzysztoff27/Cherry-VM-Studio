import re
from uuid import UUID
from fastapi import HTTPException
from application.users.models import CreateUserForm, ModifyUserForm
from application.users.users import get_user_by_email, get_user_by_username
from config.regex_config import REGEX_CONFIG

def validate_creation_details(user_data: CreateUserForm):    
    if get_user_by_username(user_data.username) is not None:
        raise HTTPException(status_code=409, detail="User with this username already exists.")
    
    if user_data.email is not None and get_user_by_email(user_data.email) is not None:
        raise HTTPException(status_code=409, detail="User with this email already exists.")
    
    if not re.match(REGEX_CONFIG.username, user_data.username):
        raise HTTPException(status_code=400, detail="Invalid username. Username must be between 3 and 24 characters in length, start with a letter and only contain alphanumeric characters, underscores, hyphens and periods.")
    
    if not re.match(REGEX_CONFIG.password, user_data.password):
        raise HTTPException(status_code=400, detail="Invalid password. Password must be at least 12 characters long and contain at least one digit, lowercase letter, upercase letter and one of the special characters.")
    
    if len(user_data.name or "") > 50:
        raise HTTPException(status_code=400, detail="Name field cannot contain more than 50 characters.")
    
    if len(user_data.surname or "") > 50:
        raise HTTPException(status_code=400, detail="Surname field cannot contain more than 50 characters.")
    
    
def validate_modification_details(uuid: str | UUID, user_data: ModifyUserForm):
    user_found_by_username = get_user_by_username(user_data.username) if user_data.username else None
    user_found_by_email    = get_user_by_email(user_data.email)       if user_data.email    else None
    
    if user_found_by_username is not None and str(user_found_by_username.uuid) != str(uuid): # theres already a different user with this new username
        raise HTTPException(status_code=409, detail="User with this username already exists.")
    
    if user_found_by_email is not None and str(user_found_by_email.uuid) != str(uuid) :
        raise HTTPException(status_code=409, detail="User with this email already exists.")
    
    if user_data.username is not None and not re.match(REGEX_CONFIG.username, user_data.username):
        raise HTTPException(status_code=400, detail="Invalid username. Username must be between 3 and 24 characters in length, start with a letter and only contain alphanumeric characters, underscores, hyphens and periods.")
    
    if user_data.name is not None and len(user_data.name) > 50:
        raise HTTPException(status_code=400, detail="Name field cannot contain more than 50 characters.")
    
    if user_data.surname is not None and len(user_data.surname) > 50:
        raise HTTPException(status_code=400, detail="Surname field cannot contain more than 50 characters.")
    