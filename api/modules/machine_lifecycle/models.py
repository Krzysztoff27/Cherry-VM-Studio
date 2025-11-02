from uuid import UUID, uuid4
from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal, Union, ClassVar

################################
#   Machine creation models
################################
DiskType = Literal["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]
StoragePools = Literal["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineMetadata
class MachineMetadata(BaseModel):
    tag: str
    value: str
    
    
class GroupMetadata(BaseModel):
    tag: ClassVar[str] = "group"
    value: str
    
    
class GroupMemberIdMetadata(BaseModel):
    tag: ClassVar[str] = "groupMemberId"
    value: Optional[str] = None


class StoragePool(BaseModel):
    # For now the StoragePool selection is limited to predefined pools on local filesystem
    pool: StoragePools
    # Volume is basically disk name + disk type eg. "disk.qcow2"
    volume: str


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineDisk
class MachineDisk(BaseModel):
    uuid: Optional[UUID] = None
    name: str
    size: int # in Bytes
    type: DiskType
    pool: StoragePools
                
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
    uuid: Optional[UUID] = None # Unique identifier                     
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
    
    assigned_clients: set[UUID]
    
    @property
    def metadata(self) -> list[Union[GroupMetadata, GroupMemberIdMetadata, MachineMetadata]]:
        base_metadata =  [self.group_metadata, self.group_member_id_metadata]
        if self.additional_metadata is not None:
            return base_metadata + self.additional_metadata
        return base_metadata
    
    
################################
#     Machine form models
################################
class CreateMachineFormDisk(BaseModel):
    is_system_disk: bool
    name: str
    size_bytes: int
    disk_type: DiskType
    
      
class CreateMachineFormConfig(BaseModel):
    ram: int
    vcpu: int
      
    
class CreateMachineForm(BaseModel):
    uuid: Optional[UUID] = None
    name: str
    description: str
    group: str
    tags: set[str]
    
    assigned_clients: set[UUID]
    
    source_type: Literal["iso", "snapshot"]
    source_uuid: UUID
    
    config: CreateMachineFormConfig
    disks: list[CreateMachineFormDisk]