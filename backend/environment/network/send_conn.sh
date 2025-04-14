#!/usr/bin/env bash
docker cp  ./libvirt_conn_test.py cherry-api:/
docker cp  ./postgres_conn_test.py cherry-api:/
docker exec cherry-api chmod +x /libvirt_conn_test.py
docker exec cherry-api chmod +x /postgres_conn_test.py
