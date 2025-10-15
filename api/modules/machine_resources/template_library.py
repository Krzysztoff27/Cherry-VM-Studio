
import logging
from typing import Literal
from modules.exceptions.models import RaisedException
from modules.machine_lifecycle.models import MachineParameters
from modules.postgresql import pool, select_schema, select_schema_one


logger = logging.getLogger(__name__)

def create_machine_template(machine: MachineParameters):
    with pool.connection() as connection:
        with connection.cursor() as cursor: 
            with connection.transaction():
                cursor.execute(f"""
                    INSERT INTO machine_templates (uuid, name, description, group_metadata, group_member_id_metadata, additional_metadata, ram, vcpu, os_type, disks, username, password, network_interfaces)
                    VALUES (%(uuid)s, %(name)s, %(description)s, %(group_metadata)s, %(group_member_id_metadata)s, %(additional_metadata)s, %(ram)s, %(vcpu)s, %(os_type)s, %(disks)s, %(username)s, %(password)s, %(network_interfaces)s)
                    """, 
                    machine.model_dump()
                )
