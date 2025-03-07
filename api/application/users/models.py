from pydantic import BaseModel

class User(BaseModel):
    uuid: str
    username: str
    email: str
    name: str
    surname: str

class UserInDB(User):
    password: str  # hashed
    
class Administrator(User):
    roles: list[str]
    
class Client(User):
    groups: list[str]