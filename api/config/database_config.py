from dataclasses import dataclass

from pydantic import BaseModel

@dataclass(frozen=True)
class DatabaseConfig:
    # host: str = "cherry-guac-db"
    # port: str = "5432"
    # user: str = "guac"
    # password: str = "guacamole"
    # dbname: str = "guacamole_db"
    host: str = "172.17.208.1"
    port: str = "9000"
    user: str = "postgres"
    password: str = "qazwsx"
    dbname: str = "cherry-dev"
    max_connections: int = 20    
    timeout_seconds: float = 5   # request timeout
    
DATABASE_CONFIG = DatabaseConfig()