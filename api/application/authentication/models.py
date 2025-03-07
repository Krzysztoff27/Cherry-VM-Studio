from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from pydantic import BaseModel
from typing import Annotated, Literal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Token = Annotated[str, Depends(oauth2_scheme)]
TokenTypes = Literal['access', 'refresh']

class Tokens(BaseModel):
    access_token: Token
    refresh_token: Token