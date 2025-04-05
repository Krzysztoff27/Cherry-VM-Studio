from application import app
from application.machines import get_machine, get_machines
from application.machines.models import MachineNetworkData
from application.authentication import DependsOnAuthentication

###############################
#       data requests
###############################

@app.get("/vm/all/networkdata", tags=['machine data'])
async def __get_all_vms_network_data__(current_user: DependsOnAuthentication) -> dict[str, MachineNetworkData]:
    
    machines = get_machines()
    network_data = {}
    for uuid, machine in machines.items():
        network_data[uuid] = machine.get_network_data()
    return network_data

@app.get("/vm/{uuid}/networkdata", tags=['machine data'])
async def __get_vm_network_data__(uuid: str, current_user: DependsOnAuthentication) -> MachineNetworkData: # 
    return get_machine(uuid).get_network_data()
