from fastapi import Depends
from pydantic import BaseModel
from typing import Annotated

from main import app
from auth import get_authorized_user, User

from models.machine_data import MachineNetworkData

###############################
#       data requests
###############################

@app.get("/vm/all/networkdata", tags=['machine data']) # * request for network data of all VMs
async def get_all_vms_network_data(
    current_user: Annotated[User, Depends(get_authorized_user)], # ! provides authentication, no need to do anything with it
) -> dict[str, MachineNetworkData]:
    # ...
    # ... code here
    # ...
    # example return:
    return {
        'b38350cf-105f-4ecd-8eb4-3d9370d39f0e': MachineNetworkData(uuid='b38350cf-105f-4ecd-8eb4-3d9370d39f0e', group='desktop', group_member_id=1, port=1001, domain='desktop1.wisniowa.oedu.pl'),
        '280af110-b78c-4c7a-a554-d38bc0c428df': MachineNetworkData(uuid='280af110-b78c-4c7a-a554-d38bc0c428df', group='desktop', group_member_id=2, port=1002, domain='desktop2.wisniowa.oedu.pl'),
        # ...
        'a923601a-fc61-44cb-b007-5df89b1966e2': MachineNetworkData(uuid='a923601a-fc61-44cb-b007-5df89b1966e2', group='server',  group_member_id=1, port=1501, domain='server1.wisniowa.oedu.pl'),
        '67ac8bfd-2b97-4196-9572-5b519960bf3f': MachineNetworkData(uuid='67ac8bfd-2b97-4196-9572-5b519960bf3f', id=18, group='server',  group_member_id=2, port=1502, domain='server2.wisniowa.oedu.pl'),
        # ...
    }

@app.get("/vm/{uuid}/networkdata", tags=['machine data']) # * request for network data of VM with specific <id>
async def get_vm_network_data(
    uuid: str,
    current_user: Annotated[User, Depends(get_authorized_user)], # ! -"-
) -> MachineNetworkData: # 
    # ...
    # ... code here
    # ...
    # example return:
    return MachineNetworkData(uuid=uuid, group='desktop', group_member_id=1, port=1001, domain='desktop1.wisniowa.oedu.pl')
