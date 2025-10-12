
import logging
import inspect

from typing import Any, Dict, Callable
from pydantic import BaseModel, ValidationError
from datetime import datetime

from server.command_runner import run_cmd
from server.command_validator import ensure_required_params, mib_to_mb
from server.models import StoragePool, MachineDisk

logger = logging.getLogger(__name__)

class ActionHandler:
    """
    Registry-based action handler.\n
    Allows to execute only registered and sanitised functions that accept a dict of params and return a serializable dict.
    """
    
    ACTIONS: Dict[str, Callable[..., Any]] = {}
    
    @classmethod
    def register(cls, name: str):
        """Register a callable as an action under a given name."""
        def _decor(fn: Callable[..., Any]):
            cls.ACTIONS[name] = fn
            logger.debug(f"Registered action: {name} -> {fn.__name__}")
            return fn
        return _decor
    
    @classmethod
    def execute(cls, action: str, params: Dict[str, Any] | None = None) -> Any:
        """Execute a registered action, supporting Pydantic models and plain args."""
        if action not in cls.ACTIONS:
            raise KeyError(f"Unknown action: {action}")

        func = cls.ACTIONS[action]
        sig = inspect.signature(func)
        params = params or {}

        # Function takes no arguments
        if not sig.parameters:
            return func()

        kwargs = {}
        for name, param in sig.parameters.items():
            ann = param.annotation
            value = params.get(name)

            if value is None and param.default is inspect.Parameter.empty:
                raise ValueError(f"Missing required parameter '{name}' for action '{action}'")

            # If annotation is a Pydantic model, validate dict -> model
            if inspect.isclass(ann) and issubclass(ann, BaseModel):
                if not isinstance(value, dict):
                    raise TypeError(f"Expected object for parameter '{name}' of type {ann.__name__}")
                try:
                    kwargs[name] = ann(**value)
                except ValidationError as e:
                    raise ValueError(f"Invalid data for '{name}' in action '{action}': {e}")
            else:
                # Basic or untyped parameter — pass through as is
                kwargs[name] = value

        try:
            return func(**kwargs)
        except Exception as e:
            logger.exception(f"Error executing action '{action}': {e}")
            raise

@ActionHandler.register("test_conn")
def _test_conn() -> dict: 
    return {"message": f"Server sucesfully received and processed the request at {datetime.now()}"}

@ActionHandler.register("check_machine_disk_existence")
def _check_machine_disk_existence(storage_pool: StoragePool) -> dict:
    
    pool = storage_pool.pool
    volume = storage_pool.volume
    
    try:
        rc = run_cmd(["virsh", "vol-info", "--pool", pool, volume])["rc"]
    except Exception as e:
        raise Exception(f"Failed to query volume info: {e}")
    
    if rc != 0:
        return {"exists": False}
    else:
        return {"exists": True}
        
@ActionHandler.register("get_machine_disk_size")
def _get_machine_disk_size(storage_pool: StoragePool) -> dict: 
    
    disk_existence = _check_machine_disk_existence(storage_pool)
    
    if not disk_existence.get("exists", False):
        raise Exception(f"machine_disk {storage_pool.volume} does not exist!")

    pool = storage_pool.pool
    volume = storage_pool.volume
    
    try:
        volume_info = run_cmd(["virsh", "vol-info", "--bytes", "--pool", pool, volume])
    except Exception as e:
        raise Exception(f"Failed to query volume info: {e}")

    capacity_bytes = None
    allocation_bytes = None
    
    for line in volume_info["stdout"].splitlines():
        line = line.strip()
        if line.startswith("Capacity:"):
            capacity_bytes = int(line.split()[1])
        elif line.startswith("Allocation:"):
            allocation_bytes = int(line.split()[1])
    
    return {
        "capacity": round(capacity_bytes / (1024 * 1024), 2) if capacity_bytes else None,
        "allocation": round(allocation_bytes / (1024 * 1024), 2) if allocation_bytes else None,
    }
        
@ActionHandler.register("create_machine_disk")
def _create_machine_disk(machine_disk: MachineDisk) -> dict:
    disk_type = machine_disk.type
    disk_name = f"{machine_disk.name}.{machine_disk.type}"
    disk_size_mb = mib_to_mb(machine_disk.size)
    
    try:
        job = run_cmd(["qemu-img", "create", "-f", disk_type, disk_name, f"{disk_size_mb}MB"])
    except Exception as e:
        raise Exception(f"Failed to create disk {disk_name}: {e}")
    
    if job["rc"] != 0:
         raise Exception(f"Failed to create disk {disk_name}: {job["stderr"]}")
    else:
        return {"message": f"Succesfully created {disk_name}"}


