from application import app
from threading import Lock
from application.authentication.validation import DependsOnAuthentication
from application.network_configuration.models import NetworkConfiguration, IntnetConfiguration, FlowState, Snapshot, SnapshotCreate
from application.network_configuration.configuration import get_current_flow_state, get_current_intnet_state, set_flow_state, set_intnets
from application.network_configuration.snapshots import *
from application.network_configuration.models import Preset
from application.network_configuration.presets import *

lock = Lock()

@app.get("/network/configuration", tags=['Network Configuration'])
def __get_current_network_configuration__(current_user: DependsOnAuthentication) -> NetworkConfiguration:
    return NetworkConfiguration(
        intnets = get_current_intnet_state(),
        **get_current_flow_state(),
    )

@app.put("/network/configuration/intnets", tags=['Network Configuration'])
def __apply_intnet_configuration_to_vms__(intnet_configuration: IntnetConfiguration, current_user: DependsOnAuthentication) -> None:
    set_intnets(intnet_configuration)
    
@app.put("/network/configuration/panelstate", tags=['Network Configuration'])
def __save_flow_state__(flow_state: FlowState, current_user: DependsOnAuthentication) -> None:
    set_flow_state(flow_state)


@app.get("/network/preset/all", tags=['Network Configuration Presets'])
def __get_presets__(current_user: DependsOnAuthentication) -> list[Preset]:
    return get_presets()

@app.get("/network/preset/{uuid}", tags=['Network Configuration Presets'])
def get_network_configuration_preset(uuid: str, current_user: DependsOnAuthentication) -> Preset:
    return get_preset(uuid)


@app.post("/network/snapshot", status_code=201, tags=['Network Configuration Snapshots'])
def __create_snapshot__(snapshot: SnapshotCreate, current_user: DependsOnAuthentication) -> Snapshot:
    with lock:
        validate_snapshot_name(snapshot.name)
        return create_snapshot(snapshot)

@app.get("/network/snapshot/all", tags=['Network Configuration Snapshots'])
def __get_snapshots__(current_user: DependsOnAuthentication) -> list[Snapshot]:
    return get_snapshots()

@app.get("/network/snapshot/{uuid}", tags=['Network Configuration Snapshots'])
def __get_snapshot__(uuid: str, current_user: DependsOnAuthentication) -> Snapshot:
    return get_snapshot(uuid)
    
@app.post("/network/snapshot/{uuid}/rename/{name}", tags=['Network Configuration Snapshots'])
def __rename_snapshot__(uuid: str, name: str, current_user: DependsOnAuthentication) -> Snapshot:
    with lock:
        validate_snapshot_name(name)
        modify_snapshot(uuid, {'name': name})
        return get_snapshot(uuid)

@app.delete("/network/snapshot/{uuid}", tags=['Network Configuration Snapshots'])
def __delete_snapshot__(uuid: str, current_user: DependsOnAuthentication):
    with lock:
        delete_snapshot(uuid)