from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Literal
from application.users.models import ClientInDB, AdministratorInDB

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineData
class MachineData(BaseModel):                       
    uuid: UUID                                      
    group: str | None = None                        
    group_member_id: int | None = None              
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
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineMetadata
class MachineMetadata(BaseModel):
    tag: str
    value: str

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineDisk
class MachineDisk(BaseModel):
    name: str                                                                           
    filepath: str                                                                       
    size: int                                                                           
    type: Literal["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]  

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineNetworkInterfaces
class MachineNetworkInterfaces(BaseModel):
    name: str                                           
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineParameters
class MachineParameters(BaseModel):                     
    name: str                                           
    title: str                                          
    description: Optional[str] = None                   
    metadata: list[MachineMetadata] = []                
    ram: int                                            
    vcpu: int                                           
    os_type: str                                        
    disks: list[MachineDisk]                            
    username: str                                       
    password: str                                       
    network_interfaces: list[MachineNetworkInterfaces]  
    