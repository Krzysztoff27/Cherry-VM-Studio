from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from pydantic import BaseModel
from typing import Annotated, Literal

###############################
#           Users
###############################


class User(BaseModel):
    username: str

class UserInDB(User):
    password: str  # hashed
    

###############################
#           Tokens
###############################

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

type Token = Annotated[str, Depends(oauth2_scheme)]
type TokenTypes = Literal['access', 'refresh']

class Tokens(BaseModel):
    access_token: str
    refresh_token: str