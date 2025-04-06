from uuid import UUID
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from application import app
from application.users.users import change_user_password, create_user, get_user_by_uuid, get_filtered_users, delete_user_by_uuid, modify_user
from application.users.permissions import verify_can_change_password, verify_can_manage_user
from application.users.models import AnyUser, CreateUserForm, Filters, AccountTypes, Administrator, Client, ModifyUserForm
from application.users.validation import validate_creation_details, validate_modification_details
from application.authentication import DependsOnAuthentication

@app.get("/user", response_model=Administrator | Client, tags=['Users'])
async def __read_user_me__(current_user: DependsOnAuthentication) -> AnyUser:
    return current_user

@app.get("/user/{uuid}", response_model=Administrator | Client, tags=['Users'])
async def __read_user__(uuid: UUID, current_user: DependsOnAuthentication) -> AnyUser:
    user = get_user_by_uuid(uuid)
    if user: 
        return user
    raise HTTPException(400, f"User with UUID={uuid} does not exist.")

@app.get("/users", response_model=dict[UUID, Administrator | Client], tags=['Users'])
async def __read_users__(
    current_user: DependsOnAuthentication,
    account_type: AccountTypes | None = None,
    group: str | None = None,
    role: str | None = None,
) -> list[AnyUser]:
    filters = Filters(account_type=account_type, group=group, role=role)
    users = get_filtered_users(filters)
    return JSONResponse(content=jsonable_encoder(users))

@app.post("/user/create", response_model=Administrator | Client, tags=['Users'])
async def __create_user__(user_data: CreateUserForm, current_user: DependsOnAuthentication) -> Administrator | Client:   
    verify_can_manage_user(current_user, user_data)
    validate_creation_details(user_data)
    return create_user(user_data)

class ChangePasswordRequest(BaseModel):
    password: str

@app.put("/user/change-password/{uuid}", response_model=None, tags=['Users'])
async def __change_password__(uuid: UUID, body: ChangePasswordRequest, current_user: DependsOnAuthentication) -> None:
    user = get_user_by_uuid(uuid)
    if user:
        verify_can_change_password(current_user, user)
        return change_user_password(uuid, body.password)

@app.put("/user/modify/{uuid}", response_model=AnyUser, tags=['Users'])
async def __modify_user__(uuid: UUID, modification_data: ModifyUserForm, current_user: DependsOnAuthentication) -> AnyUser:
    user = get_user_by_uuid(uuid)
    if user:
        verify_can_manage_user(current_user, user)
        validate_modification_details(uuid, modification_data)
        return modify_user(uuid, modification_data)
    
@app.delete("/user/delete/{uuid}", response_model=None, tags=['Users'])
async def __delete_user__(uuid: UUID, current_user: DependsOnAuthentication) -> None:
    user = get_user_by_uuid(uuid)
    if user:
        verify_can_manage_user(current_user, user)
        delete_user_by_uuid(uuid)
    
        