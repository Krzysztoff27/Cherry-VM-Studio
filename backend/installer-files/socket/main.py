import argparse
import logging
from config.logger_config import LOGGER_CONFIG
from config.socket_config import SOCKET_CONFIG
from server.server_core import CherrySocketServer


def main() -> int:
    """
    Entrypoint for SocketServer.
    """
    
    # Configure logger
    LOGGER_CONFIG.setup()
    logger = logging.getLogger(__name__)
    
    parser = argparse.ArgumentParser(prog="CherrySocket", description="CherrySocket server")
    parser.add_argument("--socket-path", default=SOCKET_CONFIG.SOCKET_PATH, help="Path to UNIX socket")
    parser.add_argument("--socket-mode", type=lambda v: int(v, 8), default=SOCKET_CONFIG.SOCKET_MODE, help="Socket file permissions")
    parser.add_argument("--socket-group", default=SOCKET_CONFIG.SOCKET_GROUP, help="Desires socket group")
    args = parser.parse_args()
    
    server = CherrySocketServer(args.socket_path, args.socket_mode, args.socket_group)
   
    try:
        server.start()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt detected. Exiting.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())