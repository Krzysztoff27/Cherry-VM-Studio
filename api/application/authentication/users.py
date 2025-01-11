from passlib.context import CryptContext
from utils.file import JSONHandler
from config import FILES_CONFIG
from application.exceptions import CredentialsException
from .models import User, UserInDB, Token
from .__validation__ import validate_user_token

users_database = JSONHandler(FILES_CONFIG.users)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(username: str) -> User | None:
    users = users_database.read()
    if username in users:
        user_dict = users[username]
        return UserInDB(**user_dict)
    
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def get_current_user(token: Token) -> User | None: 
    return validate_user_token(token, 'access', get_user)

def get_user_from_refresh_token(token: Token) -> User | None:
    return validate_user_token(token, 'refresh', get_user)

