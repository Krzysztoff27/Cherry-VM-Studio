from uuid import UUID
from application import app
from application.machines import get_all_machines, get_user_machines, get_machine
from application.machines.models import MachineData
from application.authentication import DependsOnAuthentication
from application.users.permissions import verify_permissions
from config.permissions_config import PERMISSIONS

@app.get("/machines/global", response_model=dict[UUID, MachineData], tags=['Machine Data'])
async def __get_all_machines__(current_user: DependsOnAuthentication) -> dict[UUID, MachineData]:
    verify_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS)
    # should return all machines deployed in the CVMM
    return get_all_machines()

@app.get("/machines", response_model=dict[UUID, MachineData], tags=['Machine Data'])
async def __get_user_machines__(current_user: DependsOnAuthentication) -> dict[UUID, MachineData]:
    # should return current_user's machines
    return get_user_machines(current_user.uuid)

@app.get("/machine/{uuid}", response_model=dict[UUID, MachineData], tags=['Machine Data'])
async def __get_machine__(uuid: UUID, current_user: DependsOnAuthentication) -> MachineData | None:  
    return get_machine(uuid)