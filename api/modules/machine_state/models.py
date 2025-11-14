from uuid import UUID
from pydantic import BaseModel
from typing import Literal
from modules.websockets.models import Command
from modules.users.models import ClientInDB, AdministratorInDB

################################
# Machine data retrieval models
################################

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineData
class MachineData(BaseModel):                       
    uuid: UUID                                      
    title: str | None = None
    tags: list[str] | None = None
    description: str | None = None        
    owner: AdministratorInDB | None = None          
    assigned_clients: dict[UUID, ClientInDB] = {}   
    port: int | None = None                         
    domain: str | None = None                       

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineState
class MachineState(MachineData):                    
    active: bool = False                            
    loading: bool = False                           
    active_connections: list | None = None          
    cpu: int = 0                                    
    ram_max: int | None = None                      
    ram_used: int | None = None                     
    uptime: int | None = None     

class MachineWebsocketSubscribeCommand(Command):
    method: Literal["SUBSCRIBE"]
    target: set[UUID] = set()
    

