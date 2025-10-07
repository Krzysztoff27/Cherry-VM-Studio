from uuid import UUID
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from application.app import app
from modules.exceptions.models import RaisedException
from modules.users.users import change_user_password, create_user, get_user_by_uuid, get_filtered_users, delete_user_by_uuid, modify_user
from modules.users.permissions import verify_can_change_password, verify_can_manage_user
from modules.users.models import AnyUser, ChangePasswordRequest, CreateUserForm, Filters, AccountTypes, Administrator, Client, ModifyUserForm
from modules.users.validation import validate_creation_details, validate_modification_details
from modules.authentication.validation import DependsOnAdministrativeAuthentication, DependsOnAuthentication


@app.get("/user", response_model=Administrator | Client, tags=['Users'])
async def __read_logged_in_user__(current_user: DependsOnAuthentication) -> AnyUser:
    return current_user


@app.get("/user/{uuid}", response_model=Administrator | Client, tags=['Users'])
async def __read_user__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> AnyUser:
    user = get_user_by_uuid(uuid)
    if user: 
        return user
    raise HTTPException(400, f"User with UUID={uuid} does not exist.")


@app.get("/users", response_model=dict[UUID, Administrator | Client], tags=['Users'])
async def __read_users__(
    current_user: DependsOnAdministrativeAuthentication,
    account_type: AccountTypes | None = None,
    group: UUID | None = None,
    role: UUID | None = None,
):
    filters = Filters(account_type=account_type, group=group, role=role)
    users = get_filtered_users(filters)
    return JSONResponse(content=jsonable_encoder(users))


@app.post("/user/create", response_model=Administrator | Client, tags=['Users'])
async def __create_user__(user_data: CreateUserForm, current_user: DependsOnAdministrativeAuthentication) -> Administrator | Client:   
    verify_can_manage_user(current_user, user_data)
    validate_creation_details(user_data)
    
    try:
        return create_user(user_data)
    except RaisedException:
        raise HTTPException(500, "Couldn't retrieve user data after creation")


@app.put("/user/change-password/{uuid}", response_model=None, tags=['Users'])
async def __change_password__(uuid: UUID, body: ChangePasswordRequest, current_user: DependsOnAdministrativeAuthentication) -> None:
    
    user = get_user_by_uuid(uuid)
    if not user:
        raise HTTPException(400, f"User with UUID={uuid} does not exist.")
        
    verify_can_change_password(current_user, user)
    return change_user_password(uuid, body.password)


@app.put("/user/modify/{uuid}", response_model=AnyUser, tags=['Users'])
async def __modify_user__(uuid: UUID, modification_data: ModifyUserForm, current_user: DependsOnAdministrativeAuthentication) -> AnyUser:
    
    user = get_user_by_uuid(uuid)
    if not user:
        raise HTTPException(400, f"User with UUID={uuid} does not exist.")
    
    verify_can_manage_user(current_user, user)
    validate_modification_details(uuid, modification_data)
    return modify_user(current_user, uuid, modification_data)
    
    
@app.delete("/user/delete/{uuid}", response_model=None, tags=['Users'])
async def __delete_user__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    
    user = get_user_by_uuid(uuid)
    if not user:
        raise HTTPException(400, f"User with UUID={uuid} does not exist.")
    
    verify_can_manage_user(current_user, user)
    delete_user_by_uuid(uuid)
    
        