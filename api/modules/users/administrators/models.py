import datetime as dt
from typing import Literal
from uuid import UUID, uuid4
from pydantic import BaseModel, model_validator


class AdministratorInDB(BaseModel):
    uuid: UUID
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
 
 
class RoleInDB(BaseModel):
    uuid: UUID
    name: str
    permissions: int
    
    
class Administrator(BaseModel):
    uuid: UUID
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    account_type: Literal["administrative"] = "administrative"
    roles: list[RoleInDB] = []
    permissions: int = 0

    
class Role(RoleInDB):
    users: list[AdministratorInDB] = []


    
# Forms

class CreateAdministratorForm(Administrator):
    password: str
    
    @model_validator(mode="after")
    def __randomize_uuid__(self):
        self.uuid = uuid4()
        return self