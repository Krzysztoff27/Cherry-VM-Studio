from uuid import uuid4
from pydantic import BaseModel
from typing import Literal, Union

AccountTypes = Literal["administrative", "client"]

class User(BaseModel):
    uuid: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
    account_type: AccountTypes

class Administrator(User):
    account_type: AccountTypes = 'administrative'
    roles: list[str] = []
    permissions: int = 0
    
class Client(User):
    account_type: AccountTypes = 'client'
    groups: list[str] = []   
    
class AdministratorInDB(Administrator):
    password: str
    
class ClientInDB(Client):
    password: str
    
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
        
# represents any user type
AnyUser = Union[Administrator, Client] 

# represents any user type in the database
AnyUserInDB = Union[AdministratorInDB, ClientInDB]

# represents any valid create user form
CreateUserForm = Union[CreateAdministratorForm, CreateClientForm]
    
class Filters(BaseModel):
    account_type: AccountTypes | None = None
    group: str | None = None
    
class Group(BaseModel):
    uuid: str
    name: str
    users: list[str]
    
class CreatedGroup(Group):
    uuid: str | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation