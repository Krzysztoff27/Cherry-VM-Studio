import datetime
from pydantic import BaseModel
from application.machines.models import MachineNetworkData, MachineState

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
            group_member_id = self.group_member_id,
            active=(self.group_member_id % 2),
            deployed_at=datetime.datetime(2025, 4, 12, 16, 0, 5),
            loading=False,
            cpu=24,
            ram_max=4096,
            ram_used=1024,
        )
    