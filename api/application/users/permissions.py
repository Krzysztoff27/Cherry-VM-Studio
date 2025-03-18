from fastapi import HTTPException
from config.permissions_config import PERMISSIONS
from application.users.models import User

def is_admin(user: User):
    return user.account_type == 'administrative'

def is_client(user: User):
    return user.account_type == 'client'

def get_manage_user_mask(user: User):
    return PERMISSIONS.MANAGE_ADMIN_USERS if is_admin(user) else PERMISSIONS.MANAGE_CLIENT_USERS

def has_permissions(user: User, mask: int = 0):
    return is_admin(user) and user.permissions | mask == user.permissions
    
def verify_permissions(user: User, mask: int = 0):
    if not has_permissions(user, mask):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")