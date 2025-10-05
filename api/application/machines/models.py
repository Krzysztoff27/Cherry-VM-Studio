from uuid import UUID
from pydantic import BaseModel, model_validator, ValidationError
from typing import Optional, Literal, Union
from application.websockets.models import Command
from application.users.models import ClientInDB, AdministratorInDB

################################
# Machine data retrieval models
################################

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
                      
################################
#   Machine creation models
################################

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineMetadata
class MachineMetadata(BaseModel):
    tag: str
    value: str
    
class GroupMetadata(BaseModel):
    tag = "group"
    value: str
    
class GroupMemberIdMetadata(BaseModel):
    tag = "groupMemberId"
    value: Optional[str]

class StoragePool(BaseModel):
    pool: str
    volume: str

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineDisk
class MachineDisk(BaseModel):
    name: str                                                                           
    source: Union[StoragePool, str]                                                                      
    size: int                                                                           
    type: Literal["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]  

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineNetworkInterfaces
class MachineNetworkInterface(BaseModel):
    name: str  

class MachineGraphicalFramebuffer(BaseModel):
    type: Literal["rdp", "vnc"]
    port: Union[Literal["auto"], str] 
    listen_type: Literal["network", "address"]
    listen_network: str | None = None
    listen_address: str | None = None
    
    @model_validator(mode="after")
    def check_listen_type(self):
        if self.listen_type == "network" and self.listen_network is None:
            raise ValueError("listen_network is required when listen_type is 'network'")
        if self.listen_type == "address" and self.listen_address is None:
            raise ValueError("listen_address is required when listen_type is 'address'")
        return self
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineParameters
class MachineParameters(BaseModel):
    uuid: UUID # Unique identifier                     
    name: str # Unique - libvirt requirement                                                                               
    description: Optional[str] = None
    
    group_metadata: GroupMetadata
    group_member_id_metadata: Optional[GroupMemberIdMetadata]
    additional_metadata: Optional[list[MachineMetadata]] = None 
          
    ram: int # in MiB                                  
    vcpu: int                                           
    
    system_disk: MachineDisk                        
    additional_disks: Optional[list[MachineDisk]] = None            
    
    iso_filepath: Optional[Union[StoragePool, str]] = None
                                              
    network_interfaces: Optional[list[MachineNetworkInterface]] = None
    
    framebuffer: MachineGraphicalFramebuffer
    
    @property
    def metadata(self) -> list[Union[GroupMetadata, GroupMemberIdMetadata, MachineMetadata]]:
        base_metadata =  [self.group_metadata, self.group_member_id_metadata]
        if self.additional_metadata is not None:
            return base_metadata + self.additional_metadata
        return base_metadata
    

class MachineWebsocketCommand(Command):
    method: Literal["SUBSCRIBE"]
    target: list[UUID] = []
    

