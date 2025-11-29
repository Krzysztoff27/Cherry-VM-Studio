from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import Annotated
from uuid import UUID

from application.app import app
from modules.authentication.validation import DependsOnRefreshToken, authenticate_user, get_authenticated_user, encode_guacamole_connection_string
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
async def __forwardauth__(authorization: Annotated[str | None, Header()], machine_uuid_str: Annotated[str | None, Header(alias="X-Guacamole-Machine")] = None, connection_type: Annotated[str | None, Header(alias="X-Guacamole-ConnType")] = None) -> JSONResponse:
    # 1. Validate Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPUnauthorizedException(detail="Missing or invalid Authorization header.")
    
    access_token = authorization.removeprefix("Bearer ").strip()
    user = get_authenticated_user(access_token)
    if not user:
        raise HTTPUnauthorizedException(detail="Invalid session token.")
    
    headers = {"X-Guacamole-User": str(user.uuid)}
    
    # 2. Validate guacamole connection headers - if not present, return X-Guacamole-User header only - for future universal forwardauth
    if machine_uuid_str and connection_type:
        guacamole_connection_string = encode_guacamole_connection_string(machine_uuid_str, connection_type)
        headers["X-Guacamole-String"] = guacamole_connection_string
    
    # Different services relying on forwardauth process responses in their own way.
    # For the sake of compatibility, the headers are sent in both content and headers section of the response.
    return JSONResponse(content=headers, headers=headers)