import logging

from typing import Any, Dict, List

logger = logging.getLogger(__name__)

def ensure_required_params(params: Dict[str, Any], required_keys: List[str]) -> None:
    missing_params = [key for key in required_keys if params.get(key) is None]
    
    if missing_params:
        raise ValueError(f"Missing required parameters :{','.join(missing_params)}")

def mib_to_mb(mib: float) -> float:
    return mib * 1.048576