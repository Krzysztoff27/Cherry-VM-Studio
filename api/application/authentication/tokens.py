import jwt
from datetime import datetime, timedelta, timezone
from application import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA, REFRESH_TOKEN_EXPIRE_DELTA
from application.users import AnyUser
from .models import Token, TokenTypes, Tokens


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#create_token
def create_token(type: TokenTypes, data: dict, expires_delta: timedelta) -> Token:
    to_encode = data.copy()
    to_encode.update({"token_type": type, "exp": datetime.now(timezone.utc) + expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#create_access_token
def create_access_token(data: dict, expires_delta: timedelta) -> Token:
    return create_token("access", data, expires_delta)

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#create_refresh_token
def create_refresh_token(data: dict, expires_delta: timedelta) -> Token:
    return create_token("refresh", data, expires_delta)

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#get_user_tokens
def get_user_tokens(user: AnyUser):
    return Tokens(
        access_token = create_access_token({"sub": user.uuid}, ACCESS_TOKEN_EXPIRE_DELTA),
        refresh_token = create_refresh_token({"sub": user.uuid}, REFRESH_TOKEN_EXPIRE_DELTA)
    )
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#is_token_of_type
def is_token_of_type(payload, token_type: TokenTypes):
    return payload.get("token_type") == token_type

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#is_access_token
def is_access_token(payload):
    return is_token_of_type(payload, 'access')

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#is_refresh_token
def is_refresh_token(payload):
    return is_token_of_type(payload, 'refresh')


