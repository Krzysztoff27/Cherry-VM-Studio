from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from pathlib import Path

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt, logging

from main import SECRET_KEY, ALGORITHM
from handlers.json_handler import JSONHandler

###############################
#     database reference
###############################

DB_PATH = Path('data/auth/users.local.json')
usersDatabase = JSONHandler(DB_PATH)

###############################
#           schemes
###############################

logging.getLogger('passlib').setLevel(logging.ERROR) # silence the error caused by a bug in the bcrypt package
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

###############################
#           classes
###############################

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str

class UserInDB(User):
    password: str # hashed

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


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
    except InvalidTokenError:
        raise credentials_exception
    
    user = get_user(usersDatabase.read(), username)
    if user is None:
        raise credentials_exception
    return user
