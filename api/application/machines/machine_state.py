import logging
import libvirt
import asyncio
from uuid import UUID
from application.machines.models import MachineState
from application.libvirt import LibvirtConnection
from config import MACHINES_CONFIG
from application.machines.machine_data import get_machine_data

###############################
#       VM state tasks
###############################
VIR_DOMAIN_RUNNING = 1
VIR_DOMAIN_SHUTOFF = 5
VIR_DOMAIN_CRASHED = 6
ERROR_STATES = [VIR_DOMAIN_SHUTOFF, VIR_DOMAIN_CRASHED]

vm_tasks: dict[UUID, asyncio.Task] = {}

async def wait_for_vm_state(machine):
    """
    Every state_poll_interval checks for VM state after starting it.
    
    Returns:
        - 'running' if machine started succesfully,
        - 'error' if error state,
        - 'unknown' if timeout exceeded,
    """
    async def poll_state():
        while True:
            state, _ = machine.state() #Unpacking only the 'state' part of the tuple, machine.state() called periodically returns the state() dynamically - machine is a reference not a static object with properties set during the connection lookup time
            if state == VIR_DOMAIN_RUNNING:
                return 'running'
            elif state in ERROR_STATES:
                return 'error'
            await asyncio.sleep(MACHINES_CONFIG.vm_state_poll_interval)
    
    try:
        return await asyncio.wait_for(poll_state(), MACHINES_CONFIG.vm_state_wait_timeout)
    except asyncio.TimeoutError:
        return 'unknown'
                 
async def start_vm_async(uuid: UUID):
    """
    Final async wrapper - starting VM and waiting for state feedback
    """
    try:
        with LibvirtConnection("rw") as libvirt_read_write_connection:
            machine = libvirt_read_write_connection.lookupByUUIDString(str(uuid))
            machine.create()
    except libvirt.libvirtError as e:
            if libvirt_read_write_connection.isAlive(): libvirt_read_write_connection.close()
            logging.error("Failed to start VM: {e}")
    
    result = await wait_for_vm_state(machine)
    if libvirt_read_write_connection.isAlive(): libvirt_read_write_connection.close()
    return result

async def start_vm_tracking(uuid: UUID):
    if vm_tasks.get(uuid) and not vm_tasks[uuid].done():
        logging.error("Machine is already starting!")
        return False
    
    task = asyncio.create_task(start_vm_async(uuid))
    vm_tasks[uuid] = task
    
    result = await task
    vm_tasks.pop(uuid, None)

def is_vm_loading(uuid: UUID) -> bool:
    task = vm_tasks.get(uuid)
    return task is not None and not task.done()

###############################
#       MachineState
###############################
def get_machine_state(machine) -> MachineState:
    is_active: bool = machine.state()[0] == libvirt.VIR_DOMAIN_RUNNING
    
    return MachineState.model_validate ({
        **get_machine_data(machine).model_dump(),
        'active': machine.state()[0] == libvirt.VIR_DOMAIN_RUNNING,
        'loading': is_vm_loading(machine.UUID()),
        'active_connections': [],
        'ram_max': (machine.info()[2]/1024),
        'ram_used': (machine.info()[1]/1024) if is_active else 0,
        'uptime': 0
        })
    
def fetch_machine_state(machine_uuids: list[UUID]) -> dict[UUID, MachineState]:
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return {machine_uuid: state for machine_uuid in machine_uuids if (state := get_machine_state(libvirt_readonly_connection.lookupByUUIDString(str(machine_uuid)))) is not None}
    
def check_machine_existence(uuid: UUID) -> bool:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return libvirt_readonly_connection.lookupByUUIDString(str(uuid)) is not None  