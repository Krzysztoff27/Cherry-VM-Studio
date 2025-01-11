import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone

from main import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA, REFRESH_TOKEN_EXPIRE_DELTA
from models.exceptions import CredentialsException
from app.authentication.models import User, Token, TokenTypes, Tokens
from app.authentication.users import get_user

def create_token(type: TokenTypes, data: dict, expires_delta: timedelta) -> Token:
    to_encode = data.copy()
    to_encode.update({"token_type": type, "exp": datetime.now(timezone.utc) + expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(data: dict, expires_delta: timedelta) -> Token:
    return create_token("access", data, expires_delta)

def create_refresh_token(data: dict, expires_delta: timedelta) -> Token:
    return create_token("refresh", data, expires_delta)

def get_user_tokens(user: User):
    return Tokens(
        accessToken = create_access_token({"sub": user.username}, ACCESS_TOKEN_EXPIRE_DELTA),
        refresh_token = create_refresh_token({"sub": user.username}, REFRESH_TOKEN_EXPIRE_DELTA)
    )
    
    
def is_token_of_type(payload, token_type: TokenTypes):
    return payload.get("token_type") == token_type

def is_access_token(payload):
    return is_token_of_type(payload, 'access')

def is_refresh_token(payload):
    return is_token_of_type(payload, 'refresh')

def validate_user_token(token: Token, token_type: TokenTypes) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not is_token_of_type(payload, token_type): raise InvalidTokenError
        
    except InvalidTokenError or ExpiredSignatureError:
        raise CredentialsException()  # Token is invalid

    username: str = payload.get("sub")
    user = get_user(username)
    if user is None: raise CredentialsException()
    return user
