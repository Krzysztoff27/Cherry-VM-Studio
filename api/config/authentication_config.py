from dataclasses import dataclass

@dataclass(frozen=True)
class AuthenticationConfig:
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 1440
    
AUTHENTICATION_CONFIG = AuthenticationConfig()