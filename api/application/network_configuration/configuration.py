from fastapi.encoders import jsonable_encoder

from config import FILES_CONFIG
from utils.file import JSONHandler
from .models import Intnet, IntnetConfiguration, FlowState

current_state = JSONHandler(FILES_CONFIG.network_config_state_save) 

def get_current_flow_state() -> FlowState:
    return current_state.read()

def get_current_intnet_state() -> IntnetConfiguration:
    return {
        '5952f2aa-b2c0-4214-a4f7-6ee2c9bf918e': Intnet(number=1, uuid='5952f2aa-b2c0-4214-a4f7-6ee2c9bf918e', machines=['b38350cf-105f-4ecd-8eb4-3d9370d39f0e', 'a923601a-fc61-44cb-b007-5df89b1966e2']),  
        '07e2836c-2854-4347-96e3-6cd9d233af54': Intnet(number=2, uuid='07e2836c-2854-4347-96e3-6cd9d233af54', machines=['280af110-b78c-4c7a-a554-d38bc0c428df', '67ac8bfd-2b97-4196-9572-5b519960bf3f']),
    }

def set_flow_state(flow_state: FlowState):
    current_state.write(jsonable_encoder(flow_state))    
    