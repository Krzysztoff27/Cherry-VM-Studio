from application import app
from application.machines import get_machine, get_machines
from application.machines.models import MachineNetworkData
from application.authentication import DependsOnAuthentication
import libvirt

###############################
#       data requests
###############################

@app.get("/machines/global")
async def get_all_machines(current_user: DependsOnAuthentication) -> dict[str, MachineNetworkData]:

    # should return all machines deployed in the CVMM
    
    machines = get_machines()
    network_data = {}
    for uuid, machine in machines.items():
        network_data[uuid] = machine.get_network_data()
    return network_data

@app.get("/machines", tags=['Machine Data'])
async def get_all_logged_in_users_vm_network_data__(current_user: DependsOnAuthentication) -> dict[str, MachineNetworkData]:
    
    # should return current_user's machines
    
    machines = get_machines()
    network_data = {}
    for uuid, machine in machines.items():
        network_data[uuid] = machine.get_network_data()
    return network_data

@app.get("/machine/{uuid}", tags=['Machine Data'])
async def __get_vm_network_data__(uuid: str, current_user: DependsOnAuthentication) -> MachineNetworkData: # 
    return get_machine(uuid).get_network_data()
