from config import FILES_CONFIG
from utils.file import JSONHandler
from modules.exceptions import HTTPNotFoundException
from .models import Preset

presets_database = JSONHandler(FILES_CONFIG.network_config_presets)

def get_presets() -> list[Preset]:
    presets = presets_database.read()
    if not isinstance(presets, list): 
        presets = []
    return presets

def get_preset(uuid):
    presets = get_presets()
    
    for preset in presets:
        if preset['uuid'] == uuid: 
            return preset        
    raise HTTPNotFoundException('Preset not found')