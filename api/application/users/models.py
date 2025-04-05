from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from typing import Literal, Union

AccountTypes = Literal["administrative", "client"]

# --------------------------
# database models
# --------------------------

class GroupInDB(BaseModel):
    uuid: UUID
    name: str
    
class RoleInDB(BaseModel):
    uuid: UUID
    name: str
    permissions: int
    
class AdministratorInDB(BaseModel):
    uuid: UUID
    password: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
    
class ClientInDB(BaseModel):
    uuid: UUID
    password: str
    username: str
    email: str
    name: str = ""
    surname: str = ""
    
class AdministratorsRoles(BaseModel):
    administrator_uuid: UUID
    role_uuid: UUID
    
class ClientsGroups(BaseModel):
    client_uuid: UUID
    group_uuid: UUID
    
AnyUserInDB = Union[AdministratorInDB, ClientInDB] # represents any user type in the database
    
# --------------------------
# API response return models
# --------------------------
    
class Group(GroupInDB):
    users: list[ClientInDB] = []

class Role(RoleInDB):
    users: list[AdministratorInDB] = []
    
class Administrator(AdministratorInDB):
    account_type: Literal["administrative"] = "administrative"
    roles: list[RoleInDB] = []
    permissions: int = 0

class Client(ClientInDB):
    account_type: Literal["client"] = "client"
    groups: list[GroupInDB] = []
    
AnyUser = Union[Administrator, Client] # represents any user type

# --------------------------
# API request argument models
# --------------------------

class CreatedGroup(Group):
    uuid: UUID | None = None
    users: list[UUID] = []
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = str(uuid4()) # generate random uuid on creation

class CreateAdministratorForm(Administrator):
    uuid: UUID | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = uuid4() # generate random uuid on creation
        
class CreateClientForm(Client):
    uuid: UUID | None = None
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.uuid = uuid4() # generate random uuid on creation

CreateUserForm = Union[CreateAdministratorForm, CreateClientForm] # represents any valid create user form
        
class UserModificationForm(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    roles: list[str] = []
    groups: list[str] = []
    
class Filters(BaseModel):
    account_type: AccountTypes | None = None
    group: UUID | None = None
    role: UUID | None = None
        