import re
from fastapi import HTTPException
from uuid import UUID
from fastapi.encoders import jsonable_encoder
from psycopg.types.json import Jsonb
from application.postgresql import select_schema, select_schema_one, pool
from application.exceptions import HTTPNotFoundException
from .models import Snapshot


def get_snapshot_by_uuid(uuid: UUID) -> Snapshot | None:
    return select_schema_one(Snapshot, "SELECT * FROM network_snapshots WHERE uuid = %s", [uuid])

def get_snapshot_by_name(name: str) -> Snapshot | None:
    return select_schema_one(Snapshot, "SELECT * FROM network_snapshots WHERE name = %s", [name])

def get_user_snapshots(owner_uuid: UUID) -> list[Snapshot]:
    return select_schema(Snapshot, "SELECT * FROM network_snapshots WHERE owner_uuid = %s", [owner_uuid])

def validate_snapshot_name(snapshot_name: str):
    if get_snapshot_by_name(snapshot_name):
        raise HTTPException(status_code=409, detail="Snapshot with this name already exists.")
    if not re.match(r'^[!-z]{3,24}$', snapshot_name):
        raise HTTPException(status_code=400, detail="Invalid characters in the snapshot name.")

def create_snapshot(owner_uuid: UUID, snapshot_data: Snapshot):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO network_snapshots (uuid, owner_uuid, name, intnets, positions) VALUES (%s, %s, %s, %s, %s)",
                [snapshot_data.uuid, owner_uuid, snapshot_data.name, Jsonb(jsonable_encoder(snapshot_data.intnets)), Jsonb(jsonable_encoder(snapshot_data.positions))]
            )        
            connection.commit()
    return select_schema_one(Snapshot, "SELECT * FROM network_snapshots WHERE uuid = %s", [snapshot_data.uuid])

def rename_snapshot(uuid: UUID, new_name: str):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE network_snapshots SET name = %s WHERE uuid = %s", [new_name, uuid])
            connection.commit()
    
def delete_snapshot(uuid):
    if get_snapshot_by_uuid(uuid) is None:
        raise HTTPNotFoundException(f"Snapshot with UUID={uuid} not found.")
        
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM network_snapshots WHERE uuid = %s", [uuid])
            connection.commit()
    