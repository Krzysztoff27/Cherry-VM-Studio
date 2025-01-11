from threading import Lock
from application import app
from application.network_configuration.models import Snapshot, SnapshotCreate
from application.network_configuration.snapshots import *
from application.authentication import DependsOnAuthentication

lock = Lock()

@app.post("/network/snapshot", status_code=201, tags=['network configuration snapshots'])
def __create_snapshot__(snapshot: SnapshotCreate, current_user: DependsOnAuthentication) -> Snapshot:
    with lock:
        validate_snapshot_name(snapshot.name)
        return create_snapshot(snapshot)

@app.get("/network/snapshot/all", tags=['network configuration snapshots'])
def __get_snapshots__(current_user: DependsOnAuthentication) -> list[Snapshot]:
    return get_snapshots()

@app.get("/network/snapshot/{uuid}", tags=['network configuration snapshots'])
def __get_snapshot__(uuid: str, current_user: DependsOnAuthentication) -> Snapshot:
    return get_snapshot(uuid)
    
@app.post("/network/snapshot/{uuid}/rename/{name}", tags=['network configuration snapshots'])
def __rename_snapshot__(uuid: str, name: str, current_user: DependsOnAuthentication) -> Snapshot:
    with lock:
        validate_snapshot_name(name)
        modify_snapshot(uuid, {'name': name})
        return get_snapshot(uuid)

@app.delete("/network/snapshot/{uuid}", tags=['network configuration snapshots'])
def __delete_snapshot__(uuid: str, current_user: DependsOnAuthentication):
    with lock:
        delete_snapshot(uuid)
        