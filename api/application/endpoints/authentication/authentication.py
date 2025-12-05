import logging
import re

from fastapi import Depends, Header, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, Response
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

# Currently this serves as bypass forwardauth relying on internal authentication first and external as a backup
@app.get("/forwardauth", response_model=dict[str, str], tags=['Authentication'])
async def __forwardauth__(authorization: Annotated[str | None, Header()] = None, access_token: Annotated[str | None, Cookie()] = None) -> JSONResponse | Response:
    
    if not authorization and not access_token:
        # raise HTTPUnauthorizedException(detail="Neither authorization header nor access_token cookie was provided! Unable to authenticate.")
        logger.debug("Neither authorization header nor access_token cookie was provided! Unable to authenticate.\nFalling back on external auth for trusted services.")  
    else:
    
        token = None
        
        if authorization:
            if not authorization.startswith("Bearer "):
                raise HTTPUnauthorizedException(detail="Missing or invalid Authorization header.")
        
            token = authorization.removeprefix("Bearer ").strip()

        elif access_token:
            token = access_token
        
        if token is not None:
            try:
                user = get_authenticated_user(token)
                
                headers = {"X-Guacamole-User": str(user.uuid)}
                
                return JSONResponse(status_code=200, content=headers, headers=headers)
            except Exception:
                logger.debug(f"Forwardauth failed: No user found for token {token}.")
                # raise HTTPUnauthorizedException(detail="Invalid session token.")
            
    
    # Different services relying on forwardauth process responses in their own way.
    # For the sake of compatibility, the headers are sent in both content and headers section of the response.
    return Response(status_code=200)
    # return Response(status_code=401)