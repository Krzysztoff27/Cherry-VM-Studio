from pydantic import BaseModel
from app.machines.models import MachineNetworkData, MachineState

class VirtualMachine(BaseModel):
    uuid: str                                  
    group: str | None      
    group_member_id: int | None

    def get_network_data(self):
        return MachineNetworkData(
            uuid = self.uuid,
            group = self.group,
            group_member_id = self.group_member_id
        )
    
    def get_current_state(self):
        return MachineState(
            uuid = self.uuid,
            group = self.group,
            group_member_id = self.group_member_id
        )
    