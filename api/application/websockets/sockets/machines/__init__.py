import asyncio
from application import app
from starlette.websockets import WebSocket
from .handler import MachinesWebsocketHandler
from .broadcasts import broadcast_current_data
from ...handlers.subscription_manager import SubscriptionManager

machine_broadcast_manager = SubscriptionManager(broadcast_data=broadcast_current_data)
asyncio.create_task(machine_broadcast_manager.run_continuous_broadcast(1))

@app.websocket('/ws/vm')
async def machine_state_socket(websocket: WebSocket):
    websocketHandler = MachinesWebsocketHandler(websocket=websocket, subscription_manager=machine_broadcast_manager)
    
    await websocketHandler.accept()
    await websocketHandler.listen()