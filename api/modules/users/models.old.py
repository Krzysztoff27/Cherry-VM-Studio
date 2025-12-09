import datetime as dt
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from typing import Literal, Union

AccountTypes = Literal["administrative", "client"]

# --------------------------
# database models
# --------------------------


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#GroupInDB
class GroupInDB(BaseModel):
    uuid: UUID
    name: str
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#RoleInDB
class RoleInDB(BaseModel):
    uuid: UUID
    name: str
    permissions: int
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#AdministratorInDB
class AdministratorInDB(BaseModel):
    uuid: UUID
    password: str
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#ClientInDB
class ClientInDB(BaseModel):
    uuid: UUID
    password: str
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#AdministratorsRoles
class AdministratorsRoles(BaseModel):
    administrator_uuid: UUID
    role_uuid: UUID
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#ClientsGroups
class ClientsGroups(BaseModel):
    client_uuid: UUID
    group_uuid: UUID
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#AnyUserInDB
AnyUserInDB = Union[AdministratorInDB, ClientInDB]
    
# --------------------------
# API response return models
# --------------------------
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Group
class Group(GroupInDB):
    users: list[ClientInDB] = []


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Role
class Role(RoleInDB):
    users: list[AdministratorInDB] = []
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Administrator
class Administrator(BaseModel):
    uuid: UUID
    password: str
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


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Client
class Client(BaseModel):
    uuid: UUID
    password: str
    username: str
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    creation_date: dt.date = dt.date.today()
    last_active: dt.datetime | None = None
    disabled: bool = False
    account_type: Literal["client"] = "client"
    groups: list[GroupInDB] = []
    
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#AnyUser
AnyUser = Union[Administrator, Client]


# --------------------------
# API request argument models
# --------------------------


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#CreatedGroup
class CreateGroupFrom(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    name: str
    users: list[UUID]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#CreateAdministratorForm
class CreateAdministratorForm(Administrator):
    uuid: UUID = Field(default_factory=uuid4)
    roles: list[UUID] = []
        
        
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#CreateClientForm
class CreateClientForm(Client):
    uuid: UUID = Field(default_factory=uuid4)
    groups: list[UUID] = []


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#CreateUserForm
CreateUserForm = Union[CreateAdministratorForm, CreateClientForm]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#ModifyUserForm
class ModifyUserForm(BaseModel):
    username: str | None = None
    email: str | None = None
    name: str | None = None
    surname: str | None = None
    roles: list[UUID] | None = None
    groups: list[UUID] | None = None
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Filters
class Filters(BaseModel):
    account_type: AccountTypes | None = None
    group: UUID | None = None
    role: UUID | None = None
        
        
class ChangePasswordBody(BaseModel):
    password: str
    
class RenameGroupBody (BaseModel):
    name: str