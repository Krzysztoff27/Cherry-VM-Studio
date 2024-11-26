from fastapi import Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Annotated
from pathlib import Path
from threading import Lock
import re
import uuid

from main import app
from auth import get_current_user, User

from handlers.json_handler import JSONHandler

###############################
# json data constants and handlers
###############################

CURRENT_STATE_PATH = Path('data/network_configuration/current_state.local.json')
SNAPSHOTS_PATH = Path('data/network_configuration/snapshots.local.json')
PRESETS_PATH = Path('data/network_configuration/presets.json')

current_state = JSONHandler(CURRENT_STATE_PATH) 
snapshots = JSONHandler(SNAPSHOTS_PATH) 
presets = JSONHandler(PRESETS_PATH) 

lock = Lock()

###############################
# classes & types
###############################

IntnetUuid = str
MachineUuid = str

class Intnet(BaseModel):
    uuid: IntnetUuid
    machines: list[MachineUuid] = []
    number: int | None = None

IntnetConfiguration = dict[IntnetUuid, Intnet]

class Coordinates(BaseModel):
    x: float = 0
    y: float = 0
    
class FlowState(BaseModel):
    nodes: list = []

class NetworkConfiguration(FlowState):
    intnets: IntnetConfiguration | None = None

class SnapshotCreate(NetworkConfiguration):
    name: str = "Unnamed"

class Snapshot(SnapshotCreate):
    uuid: str

class PresetCoreFunctions(BaseModel):
    getIntnet: str = ""
    getPosX: str = ""
    getPosY: str = ""

class PresetCustomFunction(BaseModel):
    expression: str = "",
    arguments: list[str] = [],

class PresetData(BaseModel):
    variables: dict[str, str] = {}
    customFunctions: dict[str, PresetCustomFunction] = {}
    coreFunctions: PresetCoreFunctions = {}

class PresetCreate(BaseModel):
    name: str = "Unnamed"
    data: PresetData = {}

class Preset(PresetCreate):
    uuid: str

###############################
# functions
###############################

intnetsDB = JSONHandler('dummies/intnets.json')

def get_current_intnet_state() -> IntnetConfiguration: # !
    return IntnetConfiguration(intnetsDB.read())

def isIndexInList(_list, index):
    return index >= 0 and index < len(_list)

def raise404(element_name: str = 'element'):
    raise HTTPException(status_code=404, detail=f"{element_name[0].upper()}{element_name[1:]} not found")

def validateJSONList(_list, element_name: str = 'element'):
    if not isinstance(_list, list): 
        raise404(element_name)

def getByUUID(_list, uuid, element_name: str = 'element'):
    for item in _list:
        if item['uuid'] == uuid: 
            return item        
    raise404(element_name)

def getIndexByUUID(_list, uuid, element_name: str = 'element'):
    for i, item in enumerate(_list):
        if item['uuid'] == uuid: 
            return i
    raise404(element_name)

###############################
# configuration requests
###############################

@app.get("/network/configuration", tags=['network configuration'])
def get_current_network_configuration(
    current_user: Annotated[User, Depends(get_current_user)]
) -> NetworkConfiguration:
    return NetworkConfiguration(
        intnets = get_current_intnet_state(),
        **current_state.read(),
    )
    

@app.put("/network/configuration/intnets", tags=['network configuration'])
def apply_intnet_configuration_to_virtual_machines(
    intnet_configuration: IntnetConfiguration,
    current_user: Annotated[User, Depends(get_current_user)],
):
    data = {}
    for [uuid, intnet] in intnet_configuration.items():
        data[uuid] = intnet.model_dump()
    
    intnetsDB.write(data)
    
    return
    
@app.put("/network/configuration/panelstate", tags=['network configuration'])
def save_flow_state(
    flow_state: FlowState,
    current_user: Annotated[User, Depends(get_current_user)],
):
    current_state.write(jsonable_encoder(flow_state))

###############################
# snapshot requests
###############################

@app.post("/network/snapshot", status_code=201, tags=['network configuration snapshots'])
def create_network_snapshot(
    snapshot: SnapshotCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Snapshot:
    with lock:
        snapshots_list = snapshots.read()
        if not isinstance(snapshots_list, list): 
            snapshots_list = []
        if not re.match(r'^[!-z]{3,24}$', snapshot.name):
            raise HTTPException(status_code=400, detail="Invalid characters in the snapshot name.")
        if any(s['name'] == snapshot.name for s in snapshots_list):
            raise HTTPException(status_code=409, detail="Snapshot with this name already exists.")

        snapshot = jsonable_encoder({**jsonable_encoder(snapshot), 'uuid': str(uuid.uuid4())})
        snapshots_list.append(snapshot)
        snapshots.write(snapshots_list)

        return snapshot

@app.get("/network/snapshot/all", tags=['network configuration snapshots'])
def get_all_snapshots(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list:
    snapshots_list = snapshots.read()
    if not isinstance(snapshots_list, list): return []
    return snapshots_list

@app.get("/network/snapshot/{uuid}", tags=['network configuration snapshots'])
def get_snapshot(
    uuid: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Snapshot:
    snapshots_list = snapshots.read()
    validateJSONList(snapshots_list, 'snapshot')
    return getByUUID(snapshots_list, uuid, 'snapshot')
    
@app.post("/network/snapshot/{uuid}/rename/{name}", tags=['network configuration snapshots'])
def rename_snapshot(
    uuid: str,
    name: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Snapshot:
    with lock:
        snapshots_list = snapshots.read()
        validateJSONList(snapshots_list, 'snapshot')

        for s in snapshots_list:
            if s['name'] == name: raise HTTPException(status_code=409, detail="Snapshot with this name already exists.")

        index = getIndexByUUID(snapshots_list, uuid, 'snapshot')
        snapshots_list[index]['name'] = name

        snapshots.write(snapshots_list)
        return snapshots_list[index]

@app.delete("/network/snapshot/{uuid}", tags=['network configuration snapshots'])
def delete_network_configuration_snapshot(
    uuid: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    with lock:
        snapshots_list = snapshots.read()
        validateJSONList(snapshots_list, 'snapshot')
        index = getIndexByUUID(snapshots_list, uuid, 'snapshot')
        snapshot = snapshots_list.pop(index)

        snapshots.write(snapshots_list)
        return snapshot

###############################
# preset requests
###############################

@app.get("/network/preset/all", tags=['network configuration presets'])
def get_all_snapshots(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list:
    presets_list = presets.read()
    if not isinstance(presets_list, list): return []
    return presets_list

@app.get("/network/preset/{uuid}", tags=['network configuration presets'])
def get_network_configuration_preset(
    uuid: str,
    current_user: Annotated[User, Depends(get_current_user)]
) -> Preset:
    presets_list = presets.read()
    validateJSONList(presets_list, 'preset')
    return getByUUID(presets_list, uuid, 'preset') 
