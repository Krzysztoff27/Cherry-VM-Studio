from pydantic import BaseModel

class Tokens(BaseModel):
    accessToken: str
    refresh_token: str


class User(BaseModel):
    username: str


class UserInDB(User):
    password: str  # hashed