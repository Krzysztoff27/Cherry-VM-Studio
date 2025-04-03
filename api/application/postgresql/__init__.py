from typing import Type
import psycopg
import psycopg_pool
from psycopg.adapt import Loader
from psycopg.rows import dict_row
from pydantic import BaseModel
from config import DATABASE_CONFIG


pool = psycopg_pool.ConnectionPool(
    conninfo=f"dbname={DATABASE_CONFIG.dbname} user={DATABASE_CONFIG.user} "
             f"host={DATABASE_CONFIG.host} port={DATABASE_CONFIG.port} "
             f"password={DATABASE_CONFIG.password}",
    min_size=1,  
    max_size=DATABASE_CONFIG.max_connections,
    kwargs={
        "row_factory": dict_row,
    },
)

def select_schema(model: Type[BaseModel], query: str, params: tuple | list | None = None) -> list[any]:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params)
            rows = cursor.fetchall() 
    return [model.model_validate(row) for row in rows]

def select_schema_dict(model: Type[BaseModel], key_name: str, query: str, params: tuple | list | None = None) -> dict[str, any]:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params)
            rows = cursor.fetchall() 
    return {row[key_name]: model.model_validate(row) for row in rows}

def select_schema_one(model: Type[BaseModel], query: str, params: tuple | list | None = None) -> Type[BaseModel] | None:
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query=query, params=params)
            row = cursor.fetchone()
    if not row:
        return None
    return model.model_validate(row)