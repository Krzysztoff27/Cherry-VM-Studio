import psycopg_pool
from psycopg.rows import dict_row
from config.database_config import DATABASE_CONFIG

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

async_pool = psycopg_pool.AsyncConnectionPool(
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