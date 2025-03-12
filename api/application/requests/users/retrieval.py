from application import app
from application.users import User, Filters, get_user_by_uuid, get_filtered_users, AccountTypes, Administrator, Client
from application.authentication import DependsOnAuthentication

@app.get("/user", response_model=Administrator | Client, tags=['users'])
async def __read_user_me__(current_user: DependsOnAuthentication) -> Administrator | Client:
    return current_user

@app.get("/user/{uuid}", response_model=Administrator | Client, tags=['users'])
async def __read_user__(uuid: str, current_user: DependsOnAuthentication) -> Administrator | Client:
    return get_user_by_uuid(uuid)

@app.get("/users", response_model=dict[str, Administrator | Client], tags=['users'])
async def __read_users__(
    current_user: DependsOnAuthentication,
    account_type: AccountTypes | None = None,
) -> list[User]:
    return get_filtered_users(Filters(account_type=account_type))