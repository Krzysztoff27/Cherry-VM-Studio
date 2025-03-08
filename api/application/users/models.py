from uuid import uuid4
from pydantic import BaseModel
from typing import Literal

AccountTypes = Literal["administrative", "client"]

class User(BaseModel):
    uuid: str
    username: str
    email: str
    name: str
    surname: str
    account_type: AccountTypes

class Administrator(User):
    roles: list[str]
    
class Client(User):
    groups: list[str]   
    
class UserInDB(User):
    password: str  # hashed
    roles: list[str] | None = None
    groups: list[str] | None = None
    
class CreatedUser(UserInDB):
    uuid: str | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation
    
class Filters(BaseModel):
    account_type: str | None = None