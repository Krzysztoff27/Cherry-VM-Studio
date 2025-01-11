from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
import re
import uuid

from config import FILES_CONFIG
from utils.file import JSONHandler
from application.exceptions import HTTPNotFoundException
from .models import Snapshot, SnapshotCreate

snapshots_database = JSONHandler(FILES_CONFIG.network_config_snapshots)

def get_snapshots() -> list[Snapshot]:
    snapshots = snapshots_database.read()
    if not isinstance(snapshots, list): 
        snapshots = []
    return snapshots

def validate_snapshot_name(snapshot_name: str):
    snapshots = get_snapshots()
    
    if not re.match(r'^[!-z]{3,24}$', snapshot_name):
        raise HTTPException(status_code=400, detail="Invalid characters in the snapshot name.")
    if any(s['name'] == snapshot_name for s in snapshots):
        raise HTTPException(status_code=409, detail="Snapshot with this name already exists.")
    
    return True

def create_snapshot(snapshot: SnapshotCreate):
    snapshots = get_snapshots()
    snapshot = jsonable_encoder({**jsonable_encoder(snapshot), 'uuid': str(uuid.uuid4())})
    snapshots.append(snapshot)
    snapshots_database.write(snapshots)
    return Snapshot(**snapshot)
    
def get_snapshot(uuid):
    snapshots = get_snapshots()
    
    for snapshot in snapshots:
        if snapshot['uuid'] == uuid: 
            return snapshot        
    raise HTTPNotFoundException('Snapshot not found')

def get_snapshot_index(uuid):
    snapshots = get_snapshots()
    
    for i, snapshot in enumerate(snapshots):
        if snapshot['uuid'] == uuid: 
            return i
    raise HTTPNotFoundException('Snapshot not found')

def modify_snapshot(uuid, data: dict):
    snapshots = get_snapshots()
    index = get_snapshot_index(uuid)
    
    snapshots[index] = jsonable_encoder(Snapshot(**{**snapshots[index], **data}))
    snapshots_database.write(snapshots)
    
def delete_snapshot(uuid):
    snapshots = get_snapshots()
    index = get_snapshot_index(uuid)
    snapshots.pop(index)
    snapshots_database.write(snapshots)
    