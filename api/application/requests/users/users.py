from fastapi import HTTPException
from application import app
from application.users.users import create_user, get_user_by_uuid, get_filtered_users, delete_user_by_uuid, modify_user
from application.users.permissions import get_manage_user_mask, verify_permissions
from application.users.models import CreateUserForm, User, Filters, AccountTypes, Administrator, Client, UserModificationForm
from application.authentication import DependsOnAuthentication

@app.get("/user", response_model=Administrator | Client, tags=['users'])
async def __read_user_me__(current_user: DependsOnAuthentication) -> Administrator | Client:
    return current_user

@app.get("/user/{uuid}", response_model=Administrator | Client, tags=['users'])
async def __read_user__(uuid: str, current_user: DependsOnAuthentication) -> Administrator | Client:
    user = get_user_by_uuid(uuid)
    if user: 
        return user
    raise HTTPException(400, f"User with uuid={uuid} does not exist.")

@app.get("/users", response_model=dict[str, Administrator | Client], tags=['users'])
async def __read_users__(
    current_user: DependsOnAuthentication,
    account_type: AccountTypes | None = None,
    group: str | None = None
) -> list[User]:
    return get_filtered_users(Filters(account_type=account_type, group=group))

@app.post("/user/create", response_model=Administrator | Client, tags=['users'])
async def __create_user__(user_data: CreateUserForm, current_user: DependsOnAuthentication) -> Administrator | Client:   
    permission = get_manage_user_mask(user_data)
    verify_permissions(current_user, permission)
    return create_user(user_data)

@app.delete("/user/delete/{uuid}", response_model=None, tags=['users'])
async def __delete_user__(uuid: str, current_user: DependsOnAuthentication) -> None:
    user = get_user_by_uuid(uuid)
    if user:
        permission = get_manage_user_mask(user)
        verify_permissions(current_user, permission)
        delete_user_by_uuid(uuid)
    
@app.post("/user/modify/{uuid}", response_model=None, tags=['users'])
async def __delete_user__(uuid: str, modification_data: UserModificationForm, current_user: DependsOnAuthentication) -> None:
    user = get_user_by_uuid(uuid)
    if user:
        permission = get_manage_user_mask(user)
        verify_permissions(current_user, permission)
        return modify_user(uuid, modification_data)
        