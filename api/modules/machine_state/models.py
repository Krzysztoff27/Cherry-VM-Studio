from uuid import UUID
from pydantic import BaseModel
from typing import Literal
from modules.websockets.models import Command
from modules.users.models import ClientInDB, AdministratorInDB
from modules.machine_lifecycle.models import DiskType
from datetime import datetime

################################
# Machine data retrieval models
################################
class StaticDiskInfo(BaseModel):
    system: bool
    name: str
    size_bytes: int
    type: DiskType
    
class DynamicDiskInfo(StaticDiskInfo):
    occupied_bytes: int

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineData
class MachineData(BaseModel):                       
    uuid: UUID                                      
    title: str | None = None
    tags: list[str] | None = None
    description: str | None = None        
    owner: AdministratorInDB | None = None          
    assigned_clients: dict[UUID, ClientInDB] = {}
    ras_ip: str | None = None   
    ras_port: int | None = None
    connections: dict[Literal["ssh", "rdp", "vnc"], str] | None = None
    disks_static: list[StaticDiskInfo] | None = None                                          

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineState
class MachineState(MachineData):                    
    active: bool = False                            
    loading: bool = False                           
    active_connections: list | None = None          
    vcpu: int = 0                                    
    ram_max: int | None = None                      
    ram_used: int | None = None                     
    boot_timestamp: datetime | None = None   
    disks_dynamic: list[DynamicDiskInfo] | None = None  

class MachineWebsocketSubscribeCommand(Command):
    method: Literal["SUBSCRIBE"]
    target: set[UUID] = set()
    

