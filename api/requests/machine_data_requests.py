from fastapi import Depends
from pydantic import BaseModel
from typing import Annotated

from main import app
from auth import get_current_user, User

from models.machine_data import MachineNetworkData
from dummies.machines import NETWORK_DATA_DUMMIES

###############################
#       data requests
###############################

@app.get("/vm/all/networkdata", tags=['machine data']) # * request for network data of all VMs
async def get_all_vms_network_data(
    current_user: Annotated[User, Depends(get_current_user)], # ! provides authentication, no need to do anything with it
) -> dict[str, MachineNetworkData]:

    return NETWORK_DATA_DUMMIES

@app.get("/vm/{uuid}/networkdata", tags=['machine data']) # * request for network data of VM with specific <id>
async def get_vm_network_data(
    uuid: str,
    current_user: Annotated[User, Depends(get_current_user)], # ! -"-
) -> MachineNetworkData: # 
    
    if uuid in NETWORK_DATA_DUMMIES.keys(): 
        return NETWORK_DATA_DUMMIES[uuid]
