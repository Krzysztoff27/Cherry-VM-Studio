import os
import stat
import signal
import logging
import grp
from pathlib import Path
from typing import Optional
import threading

from server.request_handler import ThreadedUnixServer, RequestHandler

logger = logging.getLogger(__name__)


class CherrySocketServer:
    """
    High level wrapper for threaded UNIX socket server.\n
    Runs under systemd.
    """
    
    def __init__(self, socket_path, socket_mode, socket_group):
        self.socket_path = socket_path
        self.socket_mode = socket_mode
        self.socket_group = socket_group
        
        self._server: Optional[ThreadedUnixServer] = None
        self._serve_thread: Optional[threading.Thread] = None
        self._shutdown = threading.Event()
        
    def start(self) -> None:
        
        # Check if parent directory exists and create it if not
        # Socket will fail to work properly if created in a non-existant directory
        socket_parent = Path(self.socket_path).parent
        socket_parent.mkdir(parents=True, exist_ok=True)
        
        # Try to remove stale socket if exists (in case of corrupted removal process)
        self._cleanup_stale_socket()
        
        # Create server
        self._server = ThreadedUnixServer(self.socket_path, RequestHandler)
        
        # Change socket file permissions and group ownership
        os.chmod(self.socket_path, self.socket_mode)
        
        if self.socket_group:
            try:
                gid = grp.getgrnam(self.socket_group).gr_gid
                os.chown(self.socket_path, -1, gid)
            except Exception as e:
                raise RuntimeError(f"Failed to change socket group to {self.socket_group}: {e}") from e
        
        logger.info(f"Set socket group to {self.socket_group}")
        logger.info(f"Listening on {self.socket_path} with {self.socket_mode}")
        
        # Set up signal handlers for graceful exit and shutdown
        signal.signal(signal.SIGTERM, lambda signal_number, frame_object: self.stop())
        signal.signal(signal.SIGINT, lambda signal_number, frame_object: self.stop())
        
        # Serve in current thread (until shutdown is called)
        # Cleanup on exit
        try:
            self._server.serve_forever(poll_interval=0.5)
        finally:
            self._server.server_close()
            self._cleanup_stale_socket()
        
    def _cleanup_stale_socket(self):
        path = Path(self.socket_path)
        try:
            if path.exists():
                file_stats = path.lstat()
                if stat.S_ISSOCK(file_stats.st_mode):
                    path.unlink()
        except FileNotFoundError:
            pass
        except Exception as e:
            logger.exception(f"Error occured during stale socket cleanup: {e}")
        
    def stop(self) -> None:
        logger.info("Server shutdown requested")
        if self._server:
            try:
                self._server.shutdown()
            except Exception:
                logger.exception("Error occured during server shutdown")
        self._shutdown.set()
    
    def run_forever(self) -> None:
        try:
            self.start()
        except Exception as e:
            raise Exception(f"Socket server terminaed unexpectedly: {e}")