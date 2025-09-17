from typing import Type
import psycopg
import psycopg_pool
from psycopg.adapt import Loader
from psycopg.rows import dict_row
from pydantic import BaseModel
from .models import Params
from config import DATABASE_CONFIG
from typing import Type, TypeVar, Optional, Any

T = TypeVar("T", bound=BaseModel)

pool = psycopg_pool.ConnectionPool(
    conninfo=f"dbname={DATABASE_CONFIG.dbname} user={DATABASE_CONFIG.user} "
             f"host={DATABASE_CONFIG.host} port={DATABASE_CONFIG.port} "
             f"password={DATABASE_CONFIG.password}",
    min_size=1,  
    max_size=DATABASE_CONFIG.max_connections,
    timeout=DATABASE_CONFIG.timeout_seconds,
    kwargs={
        "row_factory": dict_row, # ensure that query results are returned as a dictionary
    },
)

# sends SELECT query and returns returned rows

def select_one(query: str, params: Params | None = None) -> dict[str, any] | None:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params)
            row = cursor.fetchone()
    return row

def select_rows(query: str, params: Params | None = None) -> list[dict[str, any]]:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params)
            rows = cursor.fetchall()
    return rows

def select_single_field(key_name: str, query: str, params: Params | None = None) -> list[any]:
    rows = select_rows(query, params)
    return [row[key_name] for row in rows]

# select schema functions fetch data from the select query and validate it using the given pydantic model

def select_schema(model: Type[T], query: str, params: Params | None = None) -> list[any]:
    rows = select_rows(query, params)
    return [model.model_validate(row) for row in rows]

def select_schema_dict(model: Type[T], key_name: str, query: str, params: Params | None = None) -> dict[str, Any]:
    rows = select_rows(query, params)
    return {row[key_name]: model.model_validate(row) for row in rows}

# returns first row of the SELECT query validated with given model
def select_schema_one(model: Type[T], query: str, params: Params | None = None) -> Optional[T]:
    row = select_one(query, params)
    if not row:
        return None
    return model.model_validate(row)