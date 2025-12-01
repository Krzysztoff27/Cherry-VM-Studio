import logging
import jwt
import re
import base64

from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from .models import DecodedTokenPayload, Token, TokenTypes
from .tokens import is_token_of_type
from .passwords import verify_password
from application.env import SECRET_KEY
from config.authentication_config import AUTHENTICATION_CONFIG
from modules.exceptions import CredentialsException
from modules.users.permissions import is_admin
from modules.users.users import get_user_by_username, get_user_by_uuid, update_user_last_active
from modules.users.models import Administrator, AnyUser
from modules.postgresql import select_one

logger = logging.getLogger(__name__)

def decode_token(token: Token) -> DecodedTokenPayload:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[AUTHENTICATION_CONFIG.algorithm])
    
    return DecodedTokenPayload(
        subject=payload.get("sub"),
        expiration_date=payload.get("exp"),
        token_type=payload.get("token_type"),
    )
        

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

def encode_guacamole_connection_string(machine_uuid: UUID, connection_type: str):
    """
    Generate encoded Apache Guacamole connection string used for machine remote desktop access.
    """
    
    machine_uuid_str = str(machine_uuid)
    
    identity_source = "postgres"
    
    regex_pattern = f"^{re.escape(machine_uuid_str)}_{re.escape(connection_type)}$"
    
    select_connection_id = """
        SELECT connection_id 
        FROM guacamole_connection
        WHERE connection_name ~ %s;
    """
    
    connection_id = select_one(select_connection_id, (regex_pattern, ))
    
    if connection_id is None:
        raise Exception(f"Could not encode guacamole connection string for non-existant {connection_type} connection to machine {machine_uuid_str}.")
    
    connection_id = connection_id.get("connection_id")
    
    raw_connection_string = f"{connection_id}\0c\0{identity_source}".encode("utf-8")
    
    return base64.urlsafe_b64encode(raw_connection_string).rstrip(b"=").decode("ascii")