from uuid import UUID

from fastapi import HTTPException
from application.app import app
from modules.machines import get_all_machines, get_user_machines, get_machine_data_by_uuid, check_machine_ownership
from modules.machines.models import MachineData, MachineParameters
from modules.machines.state_management import start_machine, stop_machine
from modules.authentication.validation import DependsOnAuthentication, DependsOnAdministrativeAuthentication
from modules.users.permissions import verify_permissions, has_permissions
from config.permissions_config import PERMISSIONS
from modules.machines.machine_creation import create_machine_xml

# REQUESTS

@app.get("/machines/global", response_model=dict[UUID, MachineData], tags=['Machine Data'])
async def __get_all_machines__(current_user: DependsOnAuthentication) -> dict[UUID, MachineData]:
    verify_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS)
    return get_all_machines()

@app.get("/machines", response_model=dict[UUID, MachineData], tags=['Machine Data'])
async def __get_user_machines__(current_user: DependsOnAuthentication) -> dict[UUID, MachineData]:
    return get_user_machines(current_user.uuid)

@app.get("/machine/{uuid}", response_model=MachineData | None, tags=['Machine Data'])
async def __get_machine__(uuid: UUID, current_user: DependsOnAuthentication) -> MachineData | None:
    machine = get_machine_data_by_uuid(uuid)
    if not machine:
        raise HTTPException(404, f"Virtual machine of UUID={uuid} could not be found.")
    if not has_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS) and not check_machine_ownership(uuid, current_user.uuid):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
    return machine

@app.post("/machine/start/{uuid}", response_model=None, tags=['Machine State'])
async def __start_machine__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    machine = get_machine_data_by_uuid(uuid)
    if not machine:
        raise HTTPException(404, f"Virtual machine of UUID={uuid} could not be found.")
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS) and not check_machine_ownership(uuid, current_user.uuid):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    if not await start_machine(uuid):
        raise HTTPException(500, f"Virtual machine of UUID={uuid} failed to start.")

@app.post("/machine/stop/{uuid}", response_model=None, tags=['Machine State'])
async def __stop_machine__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    machine = get_machine_data_by_uuid(uuid)
    if not machine:
        raise HTTPException(404, f"Virtual machine of UUID={uuid} could not be found.")
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS) and not check_machine_ownership(uuid, current_user.uuid):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    if not await stop_machine(uuid):
        raise HTTPException(500, f"Virtual machine of UUID={uuid} failed to stop.")
    
@app.get("/machine/xml/create", tags=['Machine Creation'])
async def __create_machine_xml__(machine_parameters: MachineParameters, current_user: DependsOnAdministrativeAuthentication) -> str:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_xml = create_machine_xml(machine_parameters)
    return machine_xml