from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from datetime import timedelta
from typing import Annotated

from main import app
from auth import authenticate_user, get_current_user, create_access_token, create_refresh_token, User, get_user_from_refresh_token, get_user_tokens
from models.auth import Tokens
from models.exceptions import UnauthorizedException

################################
# auth requests
################################

@app.post("/token", tags=['auth'])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Tokens:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise UnauthorizedException(detail="Incorrect username or password.")
    return get_user_tokens(user)

@app.get("/user", response_model=User, tags=['auth'])
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    return current_user

@app.get("/refresh", response_model=Tokens, tags=['auth'])
async def refresh_access_token(
    current_user: Annotated[User, Depends(get_user_from_refresh_token)]
) -> Tokens:
    return get_user_tokens(current_user)
    
   