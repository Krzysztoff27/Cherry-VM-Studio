from uuid import UUID

from fastapi import HTTPException
from modules.authentication.validation import DependsOnAdministrativeAuthentication
from modules.users.models import Role
from modules.users.roles import get_all_roles, get_role_by_uuid, grant_role_to_user, revoke_role_from_user
from application.app import app

@app.get("/role/{uuid}", response_model=Role, tags=['Administrative Roles'])
async def __read_role__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> Role:
    role = get_role_by_uuid(uuid)
    if role:
        return role
    raise HTTPException(400, f"Role with UUID={uuid} does not exist.")

@app.get("/roles", response_model=dict[UUID, Role], tags=['Administrative Roles'])
async def __read_roles__(current_user: DependsOnAdministrativeAuthentication) -> dict[UUID, Role]:
    return get_all_roles()

@app.put("/role/join/{uuid}", response_model=None, tags=['Administrative Roles'])
async def __grant_role_to_user__(uuid: UUID, users: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for user in users: 
        grant_role_to_user(current_user, uuid, user)
    
@app.put("/role/leave/{uuid}", response_model=None, tags=['Administrative Roles'])
async def __revoke_role_from_user__(uuid: UUID, users: list[UUID], current_user: DependsOnAdministrativeAuthentication) -> None:
    for user in users:
        revoke_role_from_user(current_user, uuid, user)