from datetime import date
from pydantic import BaseModel
from application.users.models import ClientInDB

class VirtualMachineData(BaseModel):            # * parent class with properties needed in every request
    uuid: str                                   # unique ID for each machine
    group: str | None = None                    # string of a corresponding machine group e.g.: "desktop" or "server"
    group_member_id: int | None = None          # unique ID for each machine in the scope of a group
    assigned_clients: list[ClientInDB] = []

class MachineNetworkData(VirtualMachineData):   # * this data will be requested once per page load
    port: int | None = None                     # transport layer port used by the VM
    domain: str | None = None                   # proxy domain for the VM Apache Guacamole site
    # ... add more if required

class MachineState(VirtualMachineData):         # * when displaying a page needing this data, it will be requested every 1-3s
    active: bool = False                        # is the machine online?
    loading: bool = False                       # is the machine loading (in a state between online and offline)
    active_connections: list | None = None      # if possible, list of IP addresses 
    cpu: int = 0                                # ∈ <0,100> % of CPU usage
    ram_max: int | None = None                  # RAM assigned to the VM in MB
    ram_used: int | None = None                 # RAM used by the VM in MB
    deployed_at: date | None = None
    # ... the more the better