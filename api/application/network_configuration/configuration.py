from fastapi.encoders import jsonable_encoder

from config import FILES_CONFIG
from utils.file import JSONHandler
from .models import Intnet, IntnetConfiguration, FlowState

current_state_file = JSONHandler(FILES_CONFIG.network_config_state_save) 
intnets_file = JSONHandler(FILES_CONFIG.network_config_intnets)

def get_current_flow_state() -> FlowState:
    return current_state_file.read()

def get_current_intnet_state() -> IntnetConfiguration:
    intnets = intnets_file.read()
    if intnets:
        return intnets
    return {}

def set_flow_state(flow_state: FlowState):
    current_state_file.write(jsonable_encoder(flow_state))   
    
def set_intnets(intnets: IntnetConfiguration):
    intnets_file.write(jsonable_encoder(intnets))
    