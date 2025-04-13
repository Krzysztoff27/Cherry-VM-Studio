import psycopg

with psycopg.connect(dbname="guacamole_db", user="guac", password="guacamole", host="cherry-guac-db") as conn:
    with conn.cursor() as cur:
        result = cur.execute("SELECT * FROM clients").fetchall()
        print(result)        