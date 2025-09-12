import logging
import libvirt
import asyncio
from uuid import UUID
from application.libvirt_socket import LibvirtConnection
from config import MACHINES_CONFIG

logger = logging.getLogger(__name__)

###############################
#       VM state tasks
###############################
VIR_DOMAIN_RUNNING = 1
VIR_DOMAIN_SHUTOFF = 5
VIR_DOMAIN_CRASHED = 6
ERROR_STATES = [VIR_DOMAIN_SHUTOFF, VIR_DOMAIN_CRASHED]

vm_tasks: dict[UUID, asyncio.Task] = {}

async def wait_for_machine_state(machine):
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
    
    
###############################
#          VM Start
###############################             
async def start_machine_async(uuid: UUID):
    """
    Final async wrapper - starting VM and waiting for state feedback
    """
    with LibvirtConnection("rw") as libvirt_read_write_connection:
        try:
            machine = libvirt_read_write_connection.lookupByUUIDString(str(uuid)) #type:ignore
            logging.debug(f"Trying to start {machine}")
            machine.create()
            result = await wait_for_machine_state(machine)
            return result
        except libvirt.libvirtError as e:
            # if libvirt_read_write_connection.isAlive(): libvirt_read_write_connection.close()
            logging.error(f"Failed to start VM: {e}")

    
    # result = await wait_for_vm_state(machine)
    # if libvirt_read_write_connection.isAlive(): libvirt_read_write_connection.close()
    # return result

async def start_machine(uuid: UUID):
    if vm_tasks.get(uuid) and not vm_tasks[uuid].done():
        logging.error("Machine is already starting!")
        return False
    
    task = asyncio.create_task(start_machine_async(uuid))
    vm_tasks[uuid] = task
    
    result = await task
    vm_tasks.pop(uuid, None)

###############################
#          VM Stop
############################### 
SHUTDOWN_FLAGS = [
    libvirt.VIR_DOMAIN_SHUTDOWN_GUEST_AGENT,
    libvirt.VIR_DOMAIN_SHUTDOWN_ACPI_POWER_BTN,
    libvirt.VIR_DOMAIN_SHUTDOWN_INITCTL,
    libvirt.VIR_DOMAIN_SHUTDOWN_SIGNAL,
    libvirt.VIR_DOMAIN_SHUTDOWN_PARAVIRT,
    libvirt.VIR_DOMAIN_SHUTDOWN_DEFAULT
]

async def stop_machine_async(uuid: UUID):
    """
     Final async wrapper - stopping VM and waiting for state feedback
    """

    with LibvirtConnection("rw") as libvirt_read_write_connection:
        try:
            machine = libvirt_read_write_connection.lookupByUUIDString(str(uuid)) #type:ignore
            
            for FLAG in SHUTDOWN_FLAGS:
                try:
                    logging.debug(f"Trying to stop {machine} with {FLAG}")
                    machine.shutdownFlags(FLAG)
                    result = await wait_for_machine_state(machine)
                    
                    if result in ERROR_STATES:
                        return result
                    continue
                
                except libvirt.libvirtError as e:
                    logging.error(f"Failed to stop VM with flag {FLAG}: {e}")
                    continue
                
            logging.warning("Failed to stop VM gracefully. Forcing destroy.")
            machine.destroy()
            result = await wait_for_machine_state(machine)
            
            return result
             
        except libvirt.libvirtError as e:
            # if libvirt_read_write_connection.isAlive(): libvirt_read_write_connection.close()
            logging.error(f"Failed to stop VM: {e}")

async def stop_machine(uuid: UUID):
    if vm_tasks.get(uuid) and not vm_tasks[uuid].done():
        logging.error("Machine is already stopping!")
        return False

    task = asyncio.create_task(stop_machine_async(uuid))
    vm_tasks[uuid] = task
    
    result = await task
    vm_tasks.pop(uuid, None)


# ! to be moved to data_retrieval.py when we stop depending on the task list
def is_vm_loading(uuid: UUID) -> bool:
    task = vm_tasks.get(uuid)
    return task is not None and not task.done()

