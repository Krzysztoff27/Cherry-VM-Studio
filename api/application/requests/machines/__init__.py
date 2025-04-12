from uuid import UUID
from application import app
from application.machines import get_machine, get_machines
from application.machines.models import MachineNetworkData
from application.authentication import DependsOnAuthentication

###############################
#       data requests
###############################

@app.get("/machines/global", response_model=dict[UUID, MachineNetworkData], tags=['Machine Data'])
async def get_all_machines(current_user: DependsOnAuthentication) -> dict[UUID, MachineNetworkData]:

    # should return all machines deployed in the CVMM
    return {}

@app.get("/machines", response_model=dict[UUID, MachineNetworkData], tags=['Machine Data'])
async def get_all_logged_in_users_vm_network_data__(current_user: DependsOnAuthentication) -> dict[UUID, MachineNetworkData]:
    
    # should return current_user's machines
    return {}

@app.get("/machine/{uuid}", response_model=dict[UUID, MachineNetworkData], tags=['Machine Data'])
async def __get_vm_network_data__(uuid: str, current_user: DependsOnAuthentication) -> MachineNetworkData | None:  
    
    return None
