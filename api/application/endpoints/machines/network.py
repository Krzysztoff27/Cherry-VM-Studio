from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from modules.authentication.validation import DependsOnAdministrativeAuthentication, DependsOnAuthentication, get_authenticated_administrator
from modules.network_configuration.models import NetworkConfiguration, IntnetConfiguration, Positions, Snapshot
from modules.network_configuration.configuration import get_current_intnet_state, get_flow_node_positions, save_flow_node_positions, set_intnets
from modules.network_configuration.snapshots import *
from modules.network_configuration.models import Preset
from modules.network_configuration.presets import *

router = APIRouter(
    prefix='/network',
    dependencies=[Depends(get_authenticated_administrator)]
)
# configuration

@router.get("/configuration", response_model=NetworkConfiguration, tags=['Network Configuration'])
def __get_current_network_configuration__(current_user: DependsOnAdministrativeAuthentication) -> NetworkConfiguration:
    return jsonable_encoder(NetworkConfiguration(
        intnets = get_current_intnet_state(),
        positions = get_flow_node_positions(current_user.uuid),
    ))

@router.put("/configuration/intnets", tags=['Network Configuration'])
def __apply_intnet_configuration_to_vms__(intnet_configuration: IntnetConfiguration) -> None:
    set_intnets(intnet_configuration)
    
@router.put("/configuration/positions", tags=['Network Configuration'])
def __save_flow_state__(positions: Positions, current_user: DependsOnAdministrativeAuthentication) -> None:
    save_flow_node_positions(current_user.uuid, positions)

# presets

@router.get("/presets", tags=['Network Configuration Presets'])
def __get_presets__() -> list[Preset]:
    return get_presets()

@router.get("/preset/{uuid}", tags=['Network Configuration Presets'])
def get_network_configuration_preset(uuid: str) -> Preset:
    return get_preset(uuid)

# snapshots

@router.get("/snapshots", tags=['Network Configuration Snapshots'])
def __get_user_snapshots__(current_user: DependsOnAdministrativeAuthentication) -> list[Snapshot]:
    return get_user_snapshots(current_user.uuid)

@router.get("/snapshot/{uuid}", tags=['Network Configuration Snapshots'])
def __get_snapshot__(uuid: UUID) -> Snapshot | None:
    return get_snapshot_by_uuid(uuid)

@router.post("/snapshot", status_code=201, tags=['Network Configuration Snapshots'])
def __create_snapshot__(snapshot: Snapshot, current_user: DependsOnAdministrativeAuthentication) -> Snapshot | None:
    validate_snapshot_name(snapshot.name)
    return create_snapshot(current_user.uuid, snapshot)
    
@router.post("/snapshot/rename/{uuid}", tags=['Network Configuration Snapshots'])
def __rename_snapshot__(uuid: UUID, name: str) -> Snapshot | None:
    validate_snapshot_name(name)
    rename_snapshot(uuid, name)
    return get_snapshot_by_uuid(uuid)

@router.delete("/snapshot/{uuid}", tags=['Network Configuration Snapshots'])
def __delete_snapshot__(uuid: UUID):
    delete_snapshot(uuid)