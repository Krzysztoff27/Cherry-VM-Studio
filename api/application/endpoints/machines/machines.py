from uuid import UUID

from fastapi import HTTPException
from application.app import app
from modules.machine_state import get_all_machines, get_user_machines, get_machine_data_by_uuid, check_machine_ownership
from modules.machine_state.models import MachineData
from modules.machine_state.state_management import start_machine, stop_machine
from modules.authentication.validation import DependsOnAuthentication, DependsOnAdministrativeAuthentication
from modules.users.permissions import verify_permissions, has_permissions
from config.permissions_config import PERMISSIONS
from modules.machine_lifecycle.xml_translator import *
from modules.machine_lifecycle.machines import *
from modules.machine_lifecycle.models import MachineParameters, MachineDisk, CreateMachineForm
from .websocket import machine_broadcast_manager

################################
#         Production
################################
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

@app.post("/machine/create", response_model=UUID, tags=['Machine Creation'])
async def __async_create_machine__(machine_parameters: CreateMachineForm, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    machine_uuid = await create_machine_async(machine_parameters, current_user.uuid)
    if not machine_uuid:
        raise HTTPException(500, "Machine creation failed.")
    return machine_uuid

@app.post("/machine/create/bulk", response_model=list[UUID], tags=['Machine Creation'])
async def __async_create_machine_bulk__(machine_parameters: CreateMachineForm, current_user: DependsOnAdministrativeAuthentication, machine_count: int) -> list[UUID]:
    machine_uuid = await create_machine_async_bulk(machine_parameters, current_user.uuid, machine_count=machine_count)
    if not machine_uuid:
        raise HTTPException(500, f"Failed to create {machine_count} machines in bulk.")
    return machine_uuid

@app.post("/machine/create/for-group", response_model=list[UUID], tags=['Machine Creation'])
async def __async_create_machine_per_group__(machine_parameters: CreateMachineForm, current_user: DependsOnAdministrativeAuthentication, group_uuid: UUID) -> list[UUID]:
    machine_uuid = await create_machine_async_bulk(machine_parameters, current_user.uuid, group_uuid=group_uuid)
    if not machine_uuid:
        raise HTTPException(500, f"Machine creation for group {group_uuid} failed.")
    return machine_uuid

@app.delete("/machine/delete/{uuid}", response_model=None, tags=['Machine Creation'])
async def __delete_machine_async__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> None:
    machine = get_machine_data_by_uuid(uuid)
    if not machine:
        raise HTTPException(404, f"Virtual machine {uuid} could not be found.")
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS) and not check_machine_ownership(uuid, current_user.uuid):
        raise HTTPException(403, "You do not have the permissions necessary to manage this resource.")
    if not await delete_machine_async(uuid):
        raise HTTPException(500, f"Failed to delete machine {uuid}.")
    machine_broadcast_manager.remove_subscription_from_all(uuid)

################################
#           Debug
################################
@app.post("/debug/machine/xml/create", response_model=str, tags=['Debug'])
async def __create_machine_xml__(machine_parameters: MachineParameters, machine_uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> str:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_xml = create_machine_xml(machine_parameters, machine_uuid)
    if not machine_xml:
        raise HTTPException(500, "Machine XML creation failed.")
    return machine_xml

@app.get("/debug/machine/xml/parse", response_model=MachineParameters, tags=['Debug'])
async def __parse_machine_xml__(machine_xml: str, current_user: DependsOnAdministrativeAuthentication) -> MachineParameters:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    machine_parameters = parse_machine_xml(machine_xml)
    return machine_parameters

@app.post("/debug/machine/disk/create", response_model=UUID, tags=['Debug'])
async def __create_machine_disk__(machine_disk: MachineDisk, current_user: DependsOnAdministrativeAuthentication) -> UUID:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    disk_uuid = create_machine_disk(machine_disk)
    return disk_uuid

@app.delete("/debug/machine/disk/delete/{storage_pool}", response_model=None, tags=['Debug'])
async def __delete_machine_disk__(disk_uuid: UUID, storage_pool: str, current_user: DependsOnAdministrativeAuthentication) -> None:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    if not delete_machine_disk(disk_uuid, storage_pool):
        raise HTTPException(500, f"Failed to remove disk of UUID={disk_uuid}.")

@app.get("/debug/machine/disk/size/{storage_pool}", response_model=int, tags=['Debug'])
async def __get_machine_disk_size___(disk_uuid: UUID, storage_pool: str, current_user: DependsOnAdministrativeAuthentication) -> int:
    if not has_permissions(current_user, PERMISSIONS.MANAGE_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to manage this resource.")
    disk_size = get_machine_disk_size(disk_uuid, storage_pool)
    return disk_size
    