from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from application import app
from application.authentication import DependsOnAuthentication, DependsOnRefreshToken, authenticate_user, get_user_tokens, Tokens
from application.users import User
from application.exceptions import HTTPUnauthorizedException

FormData = Annotated[OAuth2PasswordRequestForm, Depends()]

@app.post("/token", tags=['auth'])
async def __login_for_access_token__(form_data: FormData) -> Tokens:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPUnauthorizedException(detail="Incorrect username or password.")
    return get_user_tokens(user)


@app.get("/user", response_model=User, tags=['auth'])
async def __read_users_me__(current_user: DependsOnAuthentication) -> User:
    return current_user


@app.get("/refresh", response_model=Tokens, tags=['auth'])
async def __refresh_access_token__(current_user: DependsOnRefreshToken) -> Tokens:
    return get_user_tokens(current_user)