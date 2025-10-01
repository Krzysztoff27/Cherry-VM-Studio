from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, Literal, Union
from application.websockets.models import Command
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
    
class GroupMetadata(BaseModel):
    tag: Literal["group"] = "group"
    value: str
    
class GroupMemberIdMetadata(BaseModel):
    tag: Literal["groupMemberId"] = "groupMemberId"
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
    description: Optional[str] = None
    group_metadata: GroupMetadata
    group_member_id_metadata: GroupMemberIdMetadata
    additional_metadata: Optional[list[MachineMetadata]] = None       
    ram: int # in MiB                                  
    vcpu: int                                           
    os_type: str                                        
    disks: list[MachineDisk]                            
    username: str                                       
    password: str                                       
    network_interfaces: list[MachineNetworkInterfaces]  
    
    @property
    def metadata(self) -> list[Union[GroupMetadata, GroupMemberIdMetadata, MachineMetadata]]:
        base_metadata =  [self.group_metadata, self.group_member_id_metadata]
        if self.additional_metadata is not None:
            return base_metadata + self.additional_metadata
        return base_metadata
    

class MachineWebsocketCommand(Command):
    method: Literal["SUBSCRIBE"]
    target: list[UUID] = []
    

