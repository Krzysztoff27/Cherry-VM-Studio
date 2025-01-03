from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from passlib.context import CryptContext
from pathlib import Path

from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

import jwt, logging

from main import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA, REFRESH_TOKEN_EXPIRE_DELTA
from handlers.json_handler import JSONHandler
from models.auth import User, UserInDB, Tokens
from models.exceptions import CredentialsException

###############################
#     database reference
###############################

DB_PATH = Path("data/auth/users.local.json")
usersDatabase = JSONHandler(DB_PATH)

###############################
#           schemes
###############################

logging.getLogger("passlib").setLevel(logging.ERROR)  # silence the error caused by a bug in the bcrypt package
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

###############################
#       auth functions
###############################

def get_user(db, username: str) -> User | None:
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str):
    user = get_user(usersDatabase.read(), username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_token(type: str, data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    to_encode.update({"token_type": type, "exp": datetime.now(timezone.utc) + expires_delta})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=5)):
    return create_token("access", data, expires_delta)


def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(minutes=5)):
    return create_token("refresh", data, expires_delta)

def get_user_tokens(user: User):
    return Tokens(
        accessToken = create_access_token({"sub": user.username}, ACCESS_TOKEN_EXPIRE_DELTA),
        refresh_token = create_refresh_token({"sub": user.username}, REFRESH_TOKEN_EXPIRE_DELTA)
    )

def is_token_of_type(payload, token_type: Literal['access', 'refresh']):
    return payload.get("token_type") == token_type

def is_access_token(payload):
    return is_token_of_type(payload, 'access')

def is_refresh_token(payload):
    return is_token_of_type(payload, 'refresh')

def validate_user_token(token: Annotated[str, Depends(oauth2_scheme)], token_type: Literal['access', 'refresh']) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if not is_token_of_type(payload, token_type): raise InvalidTokenError
        
    except ExpiredSignatureError:
        raise CredentialsException()  # Token is expired
    except InvalidTokenError:
        raise CredentialsException()  # Token is invalid

    username: str = payload.get("sub")
    user = get_user(usersDatabase.read(), username)
    if user is None:
        raise CredentialsException()
    return user

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User | None: 
    return validate_user_token(token, 'access')

def get_user_from_refresh_token(token: Annotated[str, Depends(oauth2_scheme)]) -> User | None:
    return validate_user_token(token, 'refresh')