from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from .models import Token, TokenTypes
from .tokens import is_token_of_type
from .passwords import verify_password
from application.env import SECRET_KEY
from config.authentication_config import AUTHENTICATION_CONFIG
from modules.exceptions import CredentialsException
from modules.users.permissions import is_admin
from modules.users.users import get_user_by_username, get_user_by_uuid, update_user_last_active
from modules.users.models import Administrator, AnyUser

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#validate_user_token
def validate_user_token(token: Token, token_type: TokenTypes) -> AnyUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[AUTHENTICATION_CONFIG.algorithm])

        if not is_token_of_type(payload, token_type):
            raise InvalidTokenError()

        sub = payload.get("sub")
        uuid = UUID(sub)
        user = get_user_by_uuid(uuid)
        
        if user is None:
            raise CredentialsException()

        update_user_last_active(user)
        return user

    except (InvalidTokenError, ExpiredSignatureError, ValueError):
        raise CredentialsException()


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#authenticate_user
def authenticate_user(username: str, password: str):
    user = get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_authenticated_user
def get_authenticated_user(token: Token) -> AnyUser: 
    return validate_user_token(token, 'access')


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_authenticated_administrator
def get_authenticated_administrator(token: Token) -> Administrator:
    user = validate_user_token(token, 'access')
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="You do not have the necessary permissions to access this resource.")    
    return user


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_from_refresh_token
def get_user_from_refresh_token(token: Token) -> AnyUser:
    return validate_user_token(token, 'refresh')

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#dependsonadministrativeauthentication
DependsOnAdministrativeAuthentication = Annotated[Administrator, Depends(get_authenticated_administrator)]

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#dependsonauthentication
DependsOnAuthentication = Annotated[AnyUser, Depends(get_authenticated_user)]

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#dependsonrefreshtoken
DependsOnRefreshToken = Annotated[AnyUser, Depends(get_user_from_refresh_token)]