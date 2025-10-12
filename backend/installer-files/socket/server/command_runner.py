import logging
import subprocess
import json

from typing import Dict, Any

from socket.config import SOCKET_CONFIG

logger = logging.getLogger(__name__)

def run_cmd(args: list[str], timeout: float = SOCKET_CONFIG.REQUEST_TIMEOUT) -> Dict[str, Any]:
    """
    Run a command, capture stdout/stderr, and return structured result.
    No shell invocation.
    """
    logger.debug(f"Running cmd: {args}")
    
    try:
        proc = subprocess.run(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as e:
        return {"rc": None, "timeout": True, "stdout": "", "stderr": str(e)}
    except FileNotFoundError as e:
        return {"rc": None, "error": "not_found", "stderr": str(e)}
    
    out = (proc.stdout or "").strip()
    err = (proc.stderr or "").strip()
    rc = proc.returncode
    
    parsed_json = None
    
    if out:
        try:
            parsed_json = json.loads(out)
        except Exception:
            parsed_json = None
            
    return {"rc": rc, "stdout": out, "stderr": err, "json": parsed_json, "timeout": False}

