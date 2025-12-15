import datetime as dt
from typing import Literal, Union
from uuid import UUID, uuid4
from pydantic import BaseModel, model_validator

# 
#   BASE TYPES
# 

AccountType = Literal["administrative", "client"]

# 
#   DATABASE MODELS
# 
class AdministratorInDB(BaseModel):
    uuid: UUID
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    
class ClientInDB(BaseModel):
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


class GroupInDB(BaseModel):
    uuid: UUID
    name: str
    
    
# 
#   BASE MODELS
# 

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
    roles: list[UUID] = []
    permissions: int = 0


class Client(BaseModel):
    uuid: UUID
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    account_type: Literal["client"] = "client"
    groups: list[UUID] = []

class Role(BaseModel):
    uuid: UUID
    name: str
    permissions: int
    users: list[UUID] = []
    
class Group(BaseModel):
    uuid: UUID
    name: str
    users: list[UUID] = []
    
# 
#   EXTENDED MODELS
# 

class AdministratorExtended(Administrator):
    roles: dict[UUID, Role] = {}
    
    
class ClientExtended(Client):
    groups: dict[UUID, Group] = {}

class RoleExtended(Role):
    users: dict[UUID, Administrator] = {}

class GroupExtended(Group):
    users: dict[UUID, Client] = {}
    

# 
#   FORMS
# 

class GetUsersFilters(BaseModel):
    account_type: AccountType | None = None
    role: UUID | None = None
    group: UUID | None = None

class CreateAdministratorForm(BaseModel):
    password: str
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    disabled: bool = False
    account_type: Literal["administrative"] = "administrative"
    roles: list[UUID] = []
    
    
class CreateClientForm(BaseModel):
    password: str
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    disabled: bool = False
    account_type: Literal["client"] = "client"
    groups: list[UUID] = []
    
class CreateGroupForm(BaseModel):
    name: str
    users: list[UUID]

class ModifyUserForm(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    roles: set[UUID] | None = None
    groups: list[UUID] | None = None
    disabled: bool | None = None
    
class ModifyUserArgs(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    disabled: bool | None = None

class CreateAdministratorArgs(CreateAdministratorForm):
    uuid: UUID = uuid4()
    
    @model_validator(mode="after")
    def __randomize_uuid__(self):
        self.uuid = uuid4()
        return self
    
class CreateClientArgs(CreateClientForm):
    uuid: UUID = uuid4()
    
    @model_validator(mode="after")
    def __randomize_uuid__(self):
        self.uuid = uuid4()
        return self
    
class CreateGroupArgs(CreateGroupForm):
    uuid: UUID = uuid4()
    
    @model_validator(mode="after")
    def __randomize_uuid__(self):
        self.uuid = uuid4()
        return self

class ChangePasswordBody(BaseModel):
    password: str
    
class RenameGroupBody (BaseModel):
    name: str

# 
#   UNIONS
# 

AnyUserInDB = Union[AdministratorInDB, ClientInDB]
AnyUser = Union[Administrator, Client]
AnyUserExtended = Union[AdministratorExtended, ClientExtended]
CreateAnyUserForm = Union[CreateAdministratorForm, CreateClientForm]