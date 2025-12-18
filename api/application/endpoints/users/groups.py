from uuid import UUID
from fastapi import HTTPException
from modules.users.users import UsersManager
from application.app import app
from modules.users.models import GroupExtended, CreateGroupForm
from modules.users.sublibraries.group_library import GroupLibrary
from modules.authentication.validation import DependsOnAdministrativeAuthentication, DependsOnAuthentication

@app.get("/group/{uuid}", response_model=GroupExtended, tags=['Client Groups'])
async def __read_group__(uuid: UUID, current_user: DependsOnAuthentication) -> GroupExtended:
    group = GroupLibrary.get_record_by_uuid(uuid)
    
    if group is None:
        raise HTTPException(400, f"Group with UUID={uuid} does not exist.")
    
    return GroupLibrary.extend_model(group)    


@app.get("/groups", response_model=dict[UUID, GroupExtended], tags=['Client Groups'])
async def __read_groups__(current_user: DependsOnAuthentication) -> dict[UUID, GroupExtended]:
    all_groups = GroupLibrary.get_all_records()
    
    for uuid, group in all_groups.items():
        all_groups[uuid] = GroupLibrary.extend_model(group)
    
    return all_groups
    

@app.post("/group/create", response_model=GroupExtended, tags=['Client Groups'])
async def __create_group__(form: CreateGroupForm, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    return UsersManager.create_group(form)


@app.delete("/group/delete/{uuid}", response_model=None, tags=['Client Groups'])
async def __delete_group__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    return GroupLibrary.remove_record(uuid)
    
    
@app.put("/group/join/{uuid}", response_model=None, tags=['Client Groups'])
async def __join_user_to_group__(uuid: UUID, clients: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for client in clients: 
        GroupLibrary.join_client_to_group(uuid, client)
        
    
@app.put("/group/leave/{uuid}", response_model=None, tags=['Client Groups'])
async def __remove_user_from_group__(uuid: UUID, clients: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for client in clients: 
        GroupLibrary.remove_client_from_group(uuid, client)
        
        
# @app.patch("/group/rename/{uuid}", response_model=None, tags=['Client Groups'])
# async def __rename_group__(uuid: UUID, form: RenameGroupBody, current_user: DependsOnAdministrativeAuthentication) -> None:
#     rename_group(uuid, form.name)