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

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#StoragePool
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
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#NetworkInterfaceSource            
class NetworkInterfaceSource(BaseModel):
    type: Literal["network", "bridge"]
    value: str

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineNetworkInterface
class MachineNetworkInterface(BaseModel):
    name: str  
    source: NetworkInterfaceSource
    
# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#MachineGraphicalFramebuffer
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
    uuid: UUID | None = None                   
    title: str                                                                             
    description: Optional[str] = None
    
    metadata: Optional[list[MachineMetadata]] = None 
          
    ram: int # in MiB                                  
    vcpu: int                                           
    
    system_disk: MachineDisk                        
    additional_disks: Optional[list[MachineDisk]] = None            
    
    iso_image: Optional[StoragePool] = None
                                              
    network_interfaces: Optional[list[MachineNetworkInterface]] = None
    
    # As long as default SSH access is not configured automatically the framebuffer element is obligatory, otherwise machine would be inaccessible.
    framebuffer: MachineGraphicalFramebuffer
    
    assigned_clients: set[UUID]
    
    
################################
#     Machine form models
################################
class CreateMachineFormDisk(BaseModel):
    name: str
    size_bytes: int
    type: DiskType
    
      
class CreateMachineFormConfig(BaseModel):
    ram: int
    vcpu: int
      
    
class CreateMachineForm(BaseModel):
    name: str
    description: str
    tags: set[str]
    
    assigned_clients: set[UUID]
    
    source_type: Literal["iso", "snapshot"]
    source_uuid: UUID
    
    config: CreateMachineFormConfig
    disks: list[CreateMachineFormDisk]
    os_disk: int = 0