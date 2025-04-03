from uuid import uuid4
from pydantic import BaseModel
from typing import Literal, Union

AccountTypes = Literal["administrative", "client"]

# groups

class Group(BaseModel):
    uuid: str
    name: str
    users: list[str]
    
class CreatedGroup(Group):
    uuid: str | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation
        
# roles

class Role(BaseModel):
    uuid: str
    name: str
    permissions: int

# users

class User(BaseModel):
    uuid: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
    account_type: AccountTypes
    
class AdministratorInDB(BaseModel):
    uuid: str
    password: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
    
class ClientInDB(BaseModel):
    uuid: str
    password: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
  
class Administrator(AdministratorInDB):
    account_type: Literal['administrative'] = 'administrative'
    roles: list[Role] = []
    permissions: int

class Client(ClientInDB):
    account_type: Literal['client'] = 'client'
    groups: list[Group] = []
    
# represents any user type
AnyUser = Union[Administrator, Client] 

# represents any user type in the database
AnyUserInDB = Union[AdministratorInDB, ClientInDB]

# represents any valid create user form
CreateUserForm = Union[CreateAdministratorForm, CreateClientForm]

class CreateAdministratorForm(AdministratorInDB):
    uuid: str | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation
        
class CreateClientForm(ClientInDB):
    uuid: str | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation
        
        
class UserModificationForm(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    roles: list[str] | None = None
    groups: list[str] | None = None
    
class Filters(BaseModel):
    account_type: AccountTypes | None = None
    group: str | None = None
    
