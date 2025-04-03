from dataclasses import dataclass

@dataclass(frozen=True)
class DatabaseConfig:
    host: str = "localhost"
    user: str = ""
    port: str = ""
    password: str = ""
    
DATABASE_CONFIG = DatabaseConfig()