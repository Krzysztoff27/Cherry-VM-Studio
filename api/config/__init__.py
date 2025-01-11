from utils.file import JSONHandler
from pydantic import BaseModel
from pathlib import Path

class FilesConfig(BaseModel):
    users: Path
    network_config_state_save: Path
    network_config_snapshots: Path
    network_config_presets: Path
    
    
class Authentication(BaseModel):
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_minutes: int
    
def get_config(name: str):
    return JSONHandler(f'./{name}.config.json').read()

FILES_CONFIG = FilesConfig(**get_config('files'))
AUTHENTICATION_CONFIG = Authentication(**get_config('Authentication'))
