from tokenize import group
from fastapi import HTTPException
from application.users.models import CreatedGroup, Group
from utils.file import JSONHandler
from config.files_config import FILES_CONFIG

groups_database = JSONHandler(FILES_CONFIG.groups)
clients_database = JSONHandler(FILES_CONFIG.clients)

def get_group_by_name(name: str) -> Group | None:
    groups = groups_database.read()
    return next((Group(**group) for group in groups.values() if group["name"] == name), None)

def get_group_by_uuid(uuid: str) -> Group | None:
    groups = groups_database.read()
    if uuid in groups:
        return Group(**groups[uuid])

def get_all_groups() -> dict[str, Group]:
    groups = groups_database.read()
    if not groups:
        return {}
    return {key: Group(**group) for key, group in groups.items()}

def delete_group_by_uuid(uuid: str):
    groups = groups_database.read()
    if uuid in groups:
        del groups[uuid]
        groups_database.write(groups)

def validate_group_details(group_data: CreatedGroup, users):
    if get_group_by_name(group_data.name) is not None:
        raise HTTPException(status_code=409, detail="Group with this name already exists")
    
    if len(group_data.name) > 50:
        raise HTTPException(status_code=400, detail="Name field cannot contain more than 50 characters.") 
    
    for uuid in group_data.users:
        if users[uuid]["account_type"] != "client":
            raise HTTPException(status_code=400, detail=f"Invalid account type assigned to a group. Only client accounts can be assigned to groups. USER_UUID={uuid}")
    

def create_group(group_data: CreatedGroup) -> Group:
    clients = clients_database.read()
    
    group_data.users = list(filter(lambda uuid : uuid in clients, group_data.users)) # remove users that do not exist
    
    validate_group_details(group_data, clients)
    
    groups = groups_database.read()
    groups[group_data.uuid] = group_data.model_dump()
    
    for user_uuid in group_data.users:
        clients[user_uuid]["groups"].append(group_data.uuid)

    clients_database.write(clients)
    groups_database.write(groups)
    
    return groups[group_data.uuid]

def add_user_to_group(group_uuid, user_uuid) -> None:
    users = users_database.read()
    groups = groups_database.read()
    
    if not groups[group_uuid]:
        raise HTTPException(400, f"Group with uuid={group_uuid} does not exist.")
    
    if not users[user_uuid]:
        raise HTTPException(400, f"User with uuid={user_uuid} does not exist.")
    
    if users[user_uuid].account_type != 'client':
        raise HTTPException(400, "Invalid user type. Only users of type client can be added to groups.")
    
    if group_uuid in users[user_uuid].groups:
        raise HTTPException(400, "User already in the group.")
       
    if not users[user_uuid].groups:
        users[user_uuid].groups = []
        
    users[user_uuid].groups.append(group_uuid)
    groups[group_uuid].users.append(user_uuid)
    
    users_database.write(users)
    groups_database.write(groups)
    
def remove_user_from_group(group_uuid, user_uuid) -> None:
    users = users_database.read()
    groups = groups_database.read()
    
    if not groups[group_uuid]:
        raise HTTPException(400, f"Group with uuid={group_uuid} does not exist.")
    
    if not users[user_uuid]:
        raise HTTPException(400, f"User with uuid={user_uuid} does not exist.")
    
    if users[user_uuid].account_type != 'client':
        raise HTTPException(400, "Invalid user type. Only users of type client can be added to groups.")
       
    if group_uuid in users[user_uuid].groups:
        raise HTTPException(400, "User does not belong to given group.")   
       
    if not users[user_uuid].groups:
        users[user_uuid].groups = []
        
    users[user_uuid].groups.remove(group_uuid)
    groups[group_uuid].users.remove(user_uuid)
    
    users_database.write(users)
    groups_database.write(groups)
    