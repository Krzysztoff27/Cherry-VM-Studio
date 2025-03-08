from application import app
from application.users import CreatedUser, create_user, delete_user_by_uuid, Administrator, Client
from application.authentication import DependsOnAuthentication

# returns created user with uuid
@app.post("/user/create", response_model=Administrator | Client, tags=['users'])
async def __create_user__(user_data: CreatedUser, current_user: DependsOnAuthentication) -> Administrator | Client:
    return create_user(user_data)

@app.delete("/user/delete", response_model=None, tags=['users'])
async def __delete_user__(uuid: str, current_user: DependsOnAuthentication) -> None:
    delete_user_by_uuid(uuid)