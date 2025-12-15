from uuid import UUID

from fastapi import HTTPException
from modules.authentication.validation import DependsOnAdministrativeAuthentication
from modules.users.models import RoleExtended
from modules.users.sublibraries.roles_library import RoleLibrary

from application.app import app

@app.get("/role/{uuid}", response_model=RoleExtended, tags=['Administrative Roles'])
async def __read_role__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> RoleExtended:
    role = RoleLibrary.get_record_by_uuid(uuid)
    
    if role is None:
        raise HTTPException(400, f"Role with UUID={uuid} does not exist.")
    
    return RoleLibrary.extend_model(role)

@app.get("/roles", response_model=dict[UUID, RoleExtended], tags=['Administrative Roles'])
async def __read_roles__(current_user: DependsOnAdministrativeAuthentication) -> dict[UUID, RoleExtended]:
    all_roles = RoleLibrary.get_all_records()
    
    for uuid, roles in all_roles.items():
        all_roles[uuid] = RoleLibrary.extend_model(roles)
    
    return all_roles
