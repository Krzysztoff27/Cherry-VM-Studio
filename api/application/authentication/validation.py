from typing import Annotated
from fastapi import Depends, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from application.users.permissions import is_admin
from application.exceptions import CredentialsException
from application import SECRET_KEY, ALGORITHM

from .models import Token, TokenTypes
from .tokens import is_token_of_type
from .passwords import verify_password
from application.users.users import get_user_by_username, update_user_last_active
from application.users.models import Administrator, AnyUser

def validate_user_token(token: Token, token_type: TokenTypes) -> AnyUser | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not is_token_of_type(payload, token_type): raise InvalidTokenError
        
    except InvalidTokenError or ExpiredSignatureError:
        raise CredentialsException()  # Token is invalid

    username: str = payload.get("sub")
    user = get_user_by_username(username)
    
    if user is None: 
        raise CredentialsException()
    
    update_user_last_active(user)
    return user

def authenticate_user(username: str, password: str):
    user = get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def get_authenticated_user(token: Token) -> AnyUser | None: 
    return validate_user_token(token, 'access')

def get_authenticated_administrator(token: Token) -> Administrator | None:
    user = validate_user_token(token, 'access')
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="You do not have the necessary permissions to access this resource.")    
    return user

def get_user_from_refresh_token(token: Token) -> AnyUser | None:
    return validate_user_token(token, 'refresh')

DependsOnAdministrativeAuthentication = Annotated[Administrator, Depends(get_authenticated_administrator)]
DependsOnAuthentication = Annotated[AnyUser, Depends(get_authenticated_user)]
DependsOnRefreshToken = Annotated[AnyUser, Depends(get_user_from_refresh_token)]