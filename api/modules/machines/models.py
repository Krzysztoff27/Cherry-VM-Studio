from uuid import UUID, uuid4
from pydantic import BaseModel, Field, model_validator, ValidationError, field_validator
from typing import Optional, Literal, Union
from modules.websockets.models import Command
from modules.users.models import ClientInDB, AdministratorInDB

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
    # For now the StoragePool selection is limited to predefined pools on local filesystem
    pool: Literal["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]
    # Volume is basically disk name + disk type eg. "disk.qcow2"
    volume: str


DiskType = Literal["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineDisk
class MachineDisk(BaseModel):
    name: str                                                                                                                                           
    size: int # in MiB 
                                                                          
    type: DiskType
    pool_type: Literal["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]
    
    source: StoragePool | None = None
    
    @field_validator("source", mode="before")
    def set_source(cls, v, info):
        if isinstance(v, StoragePool):
            return v
        
        values = info.data
        pool_type = values.get("pool_type", "cvms-disk-images")
        name = values.get("name")
        disk_type = values.get("type")

        if not name or not disk_type:
            raise ValueError("Missing 'name' or 'type' for automatic StoragePool creation")

        return StoragePool(
            pool=pool_type,
            volume=f"{name}.{disk_type}"
        )
                
class NetworkInterfaceSource(BaseModel):
    type: Literal["network", "bridge"]
    value: str

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineNetworkInterfaces
class MachineNetworkInterface(BaseModel):
    name: str  
    source: NetworkInterfaceSource
    
    
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
    # group_member_id_metadata is an ordinal number assigned during machine runtime to be displayed for informative reasons in admin-panel, therefore can be empty during MachineParameters definition
    group_member_id_metadata: Optional[GroupMemberIdMetadata] = None
    additional_metadata: Optional[list[MachineMetadata]] = None 
          
    ram: int # in MiB                                  
    vcpu: int                                           
    
    system_disk: MachineDisk                        
    additional_disks: Optional[list[MachineDisk]] = None            
    
    iso_image: Optional[StoragePool] = None
                                              
    network_interfaces: Optional[list[MachineNetworkInterface]] = None
    
    # As long as default SSH access is not configured automatically the framebuffer element is obligatory, otherwise machine would be inaccessible.
    framebuffer: MachineGraphicalFramebuffer
    
    @property
    def metadata(self) -> list[Union[GroupMetadata, GroupMemberIdMetadata, MachineMetadata]]:
        base_metadata =  [self.group_metadata, self.group_member_id_metadata]
        if self.additional_metadata is not None:
            return base_metadata + self.additional_metadata
        return base_metadata
    
      
class CreateMachineFormDisk(BaseModel):
    is_system_disk: bool
    name: str
    size_bytes: int
    disk_type: DiskType
    
      
class CreateMachineFormConfig(BaseModel):
    ram: int
    vcpu: int
      
    
class CreateMachineForm(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    name: str
    group: str
    tags: set[str]
    assigned_clients: set[UUID]
    source_type: Literal["iso", "snapshot"]
    source_uuid: UUID
    config: CreateMachineFormConfig
    disks: list[CreateMachineFormDisk]
    
    

class MachineWebsocketCommand(Command):
    method: Literal["SUBSCRIBE"]
    target: set[UUID] = set()
    

