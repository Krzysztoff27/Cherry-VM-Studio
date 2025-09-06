from dataclasses import dataclass

from pydantic import BaseModel

from os import getenv

def get_env(name: str) -> str:
    value = getenv(name)
    if not value:
        raise ValueError(f"Environmental variable {name} is either not set or empty!")
    return value
    
@dataclass(frozen=True)
class DatabaseConfig:
    host: str = get_env("DB_HOSTNAME")
    port: str = "5432"
    user: str = get_env("DB_USER")
    password: str = get_env("DB_PASSWORD")
    dbname: str = get_env("DB_NAME")
    max_connections: int = 20    
    timeout_seconds: float = 5   # request timeout
    
DATABASE_CONFIG = DatabaseConfig()