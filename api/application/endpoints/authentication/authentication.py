from fastapi import Depends, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from application.app import app
from modules.authentication.validation import DependsOnRefreshToken, authenticate_user, get_authenticated_user
from modules.authentication.tokens import get_user_tokens
from modules.authentication.models import Tokens
from modules.exceptions import HTTPUnauthorizedException

FormData = Annotated[OAuth2PasswordRequestForm, Depends()]

@app.post("/token", response_model=Tokens, tags=['Authentication'])
async def __login_for_access_token__(form_data: FormData) -> Tokens:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPUnauthorizedException(detail="Incorrect username or password.")
    return get_user_tokens(user)

@app.get("/refresh", response_model=Tokens, tags=['Authentication'])
async def __refresh_access_token__(current_user: DependsOnRefreshToken) -> Tokens:
    return get_user_tokens(current_user)

@app.get("/forwardauth", response_model=dict[str, str], tags=['Authentication'])
async def __forwardauth__(tokens: Annotated[Tokens, Cookie()]) -> dict[str, str]:
    user = get_authenticated_user(tokens.access_token)
    if not user:
        raise HTTPUnauthorizedException(detail="Invalid session token.")
    headers = {"X-Guacamole-User": str(user.uuid)}
    return headers