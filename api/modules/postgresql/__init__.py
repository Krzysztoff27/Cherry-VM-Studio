from typing import Type
import psycopg_pool
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


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#select_one
def select_one(query: str, params: Params | None = None) -> dict[str, Any] | None:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params) #type: ignore[arg-type]
            row = cursor.fetchone()
    return row


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#select_rows
def select_rows(query: str, params: Params | None = None) -> list[dict[str, Any]]:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params) #type: ignore[arg-type]
            rows = cursor.fetchall()
    return rows


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#name
def select_single_field(key_name: str, query: str, params: Params | None = None) -> list[Any]:
    rows = select_rows(query, params)
    return [row[key_name] for row in rows]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#select_schema
def select_schema(model: Type[T], query: str, params: Params | None = None) -> list[Any]:
    rows = select_rows(query, params)
    return [model.model_validate(row) for row in rows]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#select_schema_dict
def select_schema_dict(model: Type[T], key_name: str, query: str, params: Params | None = None) -> dict[Any, Any]:
    rows = select_rows(query, params)
    return {row[key_name]: model.model_validate(row) for row in rows}


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#select_schema_one
def select_schema_one(model: Type[T], query: str, params: Params | None = None) -> Optional[T]:
    row = select_one(query, params)
    if not row:
        return None
    return model.model_validate(row)