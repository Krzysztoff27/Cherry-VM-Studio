import psycopg
from config import DATABASE_CONFIG

connection = psycopg.connect(DATABASE_CONFIG)

database_cursor = connection.cursor()