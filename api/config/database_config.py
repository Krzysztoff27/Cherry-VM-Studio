from dataclasses import dataclass

from pydantic import BaseModel

@dataclass(frozen=True)
class DatabaseConfig:
    host: str = "localhost"
    port: str = "9000"
    user: str = "postgres"
    password: str = "qazwsx"
    dbname: str = "cherry-dev"
    max_connections: int = 20    
    timeout_seconds: float = 5   # request timeout
    
DATABASE_CONFIG = DatabaseConfig()