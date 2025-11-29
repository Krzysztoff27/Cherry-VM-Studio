import logging
import re

from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import Annotated
from devtools import pprint
from uuid import UUID

from application.app import app
from modules.authentication.validation import DependsOnRefreshToken, authenticate_user, get_authenticated_user, encode_guacamole_connection_string
from modules.authentication.tokens import get_user_tokens
from modules.authentication.models import Tokens
from modules.exceptions import HTTPUnauthorizedException

FormData = Annotated[OAuth2PasswordRequestForm, Depends()]

logger = logging.getLogger(__name__)

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
async def __forwardauth__(authorization: Annotated[str | None, Header()], x_forwarded_uri: Annotated[str | None, Header()]) -> JSONResponse:
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPUnauthorizedException(detail="Missing or invalid Authorization header.")
    
    token = authorization.removeprefix("Bearer ").strip()
    user = get_authenticated_user(token)
    if not user:
        raise HTTPUnauthorizedException(detail="Invalid session token.")
    
    headers = {"X-Guacamole-User": str(user.uuid)}
    
    if not x_forwarded_uri:
        raise HTTPUnauthorizedException(detail="Missing X-Forwarded-Uri header.")
    
    PATH_REGEX = re.compile(r"^/(rdp|vnc|ssh)/([0-9a-fA-F-]+)")
    path_match = PATH_REGEX.search(x_forwarded_uri)
    if not path_match:
        raise HTTPUnauthorizedException(detail="Invalid URI format.")
    
    connection_type = path_match.group(1)
    machine_uuid_str = path_match.group(2)
    
    if machine_uuid_str and connection_type:
        guacamole_connection_string = encode_guacamole_connection_string(machine_uuid_str, connection_type)
        headers["X-Guacamole-String"] = guacamole_connection_string
    
    # Different services relying on forwardauth process responses in their own way.
    # For the sake of compatibility, the headers are sent in both content and headers section of the response.
    return JSONResponse(content=headers, headers=headers)