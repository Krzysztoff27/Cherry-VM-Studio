import jwt
from typing import Callable

from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from application.exceptions import CredentialsException

from application import SECRET_KEY, ALGORITHM
from .models import Token, TokenTypes, User
from .tokens import is_token_of_type

def validate_user_token(token: Token, token_type: TokenTypes, get_user_func: Callable[[str], User | None]) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not is_token_of_type(payload, token_type): raise InvalidTokenError
        
    except InvalidTokenError or ExpiredSignatureError:
        raise CredentialsException()  # Token is invalid

    username: str = payload.get("sub")
    user = get_user_func(username)
    if user is None: raise CredentialsException()
    return user