from uuid import UUID
from fastapi.encoders import jsonable_encoder
from psycopg.types.json import Jsonb

from config import FILES_CONFIG
from utils.file import JSONHandler
from .models import IntnetConfiguration, Positions
from application.postgresql import pool, select_one

intnets_file = JSONHandler(FILES_CONFIG.network_config_intnets)

# intnets

def get_current_intnet_state() -> IntnetConfiguration:
    intnets = intnets_file.read()
    if intnets:
        return intnets
    return {}

def set_intnets(intnets: IntnetConfiguration):
    intnets_file.write(jsonable_encoder(intnets))
    
# flow state

def get_flow_node_positions(owner_uuid: UUID) -> Positions:
    row = select_one("SELECT positions FROM network_panel_states WHERE owner_uuid = %s", [owner_uuid]);
    if not row:
        return {}
    return row["positions"]

def save_flow_node_positions(owner_uuid: UUID, positions: Positions):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM network_panel_states WHERE owner_uuid = %s", [owner_uuid])
            cursor.execute("INSERT INTO network_panel_states (owner_uuid, positions) VALUES (%s, %s)", [owner_uuid, Jsonb(jsonable_encoder(positions))])
            connection.commit()
            
            
            
    
    