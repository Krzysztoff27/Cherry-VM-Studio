from pydantic import BaseModel
from typing import Literal

class User(BaseModel):
    uuid: str
    username: str
    email: str
    name: str
    surname: str
    account_type: Literal["administrative", "client"]

class UserInDB(User):
    password: str  # hashed
    
class Administrator(User):
    roles: list[str]
    
class Client(User):
    groups: list[str]
    
class Filters(BaseModel):
    account_type: str | None = None