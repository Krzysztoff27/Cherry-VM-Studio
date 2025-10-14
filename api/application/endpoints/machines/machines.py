from uuid import UUID

from fastapi import HTTPException
from application.app import app
from modules.machines_state import get_all_machines, get_user_machines, get_machine_data_by_uuid, check_machine_ownership
from modules.machines_state.models import MachineData
from modules.machines_state.state_management import start_machine, stop_machine
from modules.authentication.validation import DependsOnAuthentication, DependsOnAdministrativeAuthentication
from modules.users.permissions import verify_permissions, has_permissions
from config.permissions_config import PERMISSIONS
from modules.machine_lifecycle.xml_translator import *
from modules.machine_lifecycle.machines import *
from modules.machine_lifecycle.models import MachineParameters, MachineDisk

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
    
@app.get("/machine/xml/create", response_model=str, tags=['Machine Creation'])
async def __create_machine_xml__(machine_parameters: MachineParameters, machine_uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> str:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_xml = create_machine_xml(machine_parameters, machine_uuid)
    return machine_xml

@app.get("/machine/xml/parse", response_model=MachineParameters, tags=['Machine Creation'])
async def __parse_machine_xml__(machine_xml: str, current_user: DependsOnAdministrativeAuthentication) -> MachineParameters:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_parameters = parse_machine_xml(machine_xml)
    return machine_parameters

@app.post("/machine/disk/create", response_model=UUID, tags=['Machine Creation'])
async def __create_machine_disk__(machine_disk: MachineDisk, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    disk_uuid = create_machine_disk(machine_disk)
    return disk_uuid

@app.delete("/machine/disk/delete/{storage_pool}", response_model=None, tags=['Machine State'])
async def __delete_machine_disk__(disk_uuid: UUID, storage_pool: str, current_user: DependsOnAdministrativeAuthentication) -> None:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    if not delete_machine_disk(disk_uuid, storage_pool):
        raise HTTPException(500, f"Failed to remove disk of UUID={disk_uuid}.")

@app.get("/machine/disk/size/{storage_pool}", response_model=int, tags=['Machine Governance'])
async def __get_machine_disk_size___(disk_uuid: UUID, storage_pool: str, current_user: DependsOnAdministrativeAuthentication) -> int:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    disk_size = get_machine_disk_size(disk_uuid, storage_pool)
    return disk_size

@app.post("/machine/create", response_model=UUID, tags=['Machine Creation'])
async def __create_machine__(machine_parameters: MachineParameters, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_xml = create_machine(machine_parameters)
    return machine_xml

@app.delete("/machine/delete/{uuid}", response_model=bool, tags=['Machine Creation'])
async def __delete_machine__(machine_uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    machine = get_machine_data_by_uuid(machine_uuid)
    if not machine:
        raise HTTPException(404, f"Virtual machine of UUID={machine_uuid} could not be found.")
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    if not await delete_machine(machine_uuid):
        raise HTTPException(500, f"Failed to delete machine of UUID={machine_uuid}.")
    