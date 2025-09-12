from fastapi import HTTPException
from config.permissions_config import PERMISSIONS
from application.users.models import AnyUser, RoleInDB

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#is_admin
def is_admin(user: AnyUser):
    return user.account_type == 'administrative'


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#is_client
def is_client(user: AnyUser):
    return user.account_type == 'client'


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#has_permissions
def has_permissions(user: AnyUser, mask: int = 0):
    return is_admin(user) and user.permissions | mask == user.permissions
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#verify_permissions    
def verify_permissions(user: AnyUser, mask: int = 0):
    if not has_permissions(user, mask):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
 
 
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#verify_can_manage_user    
def verify_can_manage_user(current_user: AnyUser, modified_user: AnyUser):
    if current_user.uuid == modified_user.uuid:
        return
    
    mask = PERMISSIONS.MANAGE_ADMIN_USERS if is_admin(modified_user) else PERMISSIONS.MANAGE_CLIENT_USERS    
    verify_permissions(current_user, mask)
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#verify_can_change_password        
def verify_can_change_password(current_user: AnyUser, modified_user: AnyUser):
    if current_user.uuid == modified_user.uuid:
        return
    
    mask = PERMISSIONS.CHANGE_ADMIN_PASSWORD if is_admin(modified_user) else PERMISSIONS.CHANGE_CLIENT_PASSWORD    
    verify_permissions(current_user, mask)
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#verify_permission_integrity
def verify_permission_integrity(assigned_roles: RoleInDB):
    max_permissions = PERMISSIONS.get_max_permissions()
    permissions = 0
    for role in assigned_roles:
        permissions |= role.permissions
        if permissions == max_permissions:
            return True
    return permissions == max_permissions 