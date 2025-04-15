from dataclasses import dataclass

from pydantic import BaseModel

@dataclass(frozen=True)
class DatabaseConfig:
    host: str = "cherry-guac-db"
    port: str = "5432"
    user: str = "guac"
    password: str = "guacamole"
    dbname: str = "guacamole_db"
    max_connections: int = 20    
    timeout_seconds: float = 5   # request timeout
    
DATABASE_CONFIG = DatabaseConfig()