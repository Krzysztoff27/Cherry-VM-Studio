from uuid import UUID
from fastapi import HTTPException
from application import app
from application.users.models import CreatedGroup, Group
from application.users.groups import create_group, delete_group_by_uuid, get_all_groups, get_group_by_uuid, join_user_to_group, remove_user_from_group
from application.authentication.validation import DependsOnAdministrativeAuthentication, DependsOnAuthentication

@app.get("/group/{uuid}", response_model=Group, tags=['Client Groups'])
async def __read_group__(uuid: UUID, current_user: DependsOnAuthentication) -> Group:
    group = get_group_by_uuid(uuid)
    if group:
        return group
    raise HTTPException(400, f"Group with UUID={uuid} does not exist.")

@app.get("/groups", response_model=dict[UUID, Group], tags=['Client Groups'])
async def __read_groups__(current_user: DependsOnAuthentication) -> dict[UUID, Group]:
    return get_all_groups()

@app.post("/group/create", response_model=Group, tags=['Client Groups'])
async def __create_group__(group_data: CreatedGroup, current_user: DependsOnAdministrativeAuthentication) -> Group:
    return create_group(group_data)

@app.delete("/group/delete/{uuid}", response_model=None, tags=['Client Groups'])
async def __delete_group__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    delete_group_by_uuid(uuid)
    
@app.put("/group/join/{uuid}", response_model=None, tags=['Client Groups'])
async def __join_user_to_group__(uuid: UUID, users: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for user in users: 
        join_user_to_group(uuid, user)
    
@app.put("/group/leave/{uuid}", response_model=None, tags=['Client Groups'])
async def __join_user_to_group__(uuid: UUID, users: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for user in users:
        remove_user_from_group(uuid, user)