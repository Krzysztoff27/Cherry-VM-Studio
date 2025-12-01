import logging
import re

from fastapi import Depends, Header, Cookie
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
async def __forwardauth__(authorization: Annotated[str | None, Header()] = None, access_token: Annotated[str | None, Cookie()] = None) -> JSONResponse:
    
    if not authorization and not access_token:
        raise HTTPUnauthorizedException(detail="Neither authorization header nor access_token cookie was provided! Unable to authenticate.")
    
    token = ""
    
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPUnauthorizedException(detail="Missing or invalid Authorization header.")
    
        token = authorization.removeprefix("Bearer ").strip()

    elif access_token:
        token = access_token
        
    user = get_authenticated_user(token)
    if not user:
        logger.error(f"Forwardauth failed: No user found for token {token}.")
        raise HTTPUnauthorizedException(detail="Invalid session token.")
    
    headers = {"X-Guacamole-User": str(user.uuid)}
    
    # Different services relying on forwardauth process responses in their own way.
    # For the sake of compatibility, the headers are sent in both content and headers section of the response.
    return JSONResponse(content=headers, headers=headers)