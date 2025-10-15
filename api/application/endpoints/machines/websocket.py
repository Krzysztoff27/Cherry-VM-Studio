import asyncio
from application.app import app
from fastapi import WebSocket
from modules.machine_state.websocket_broadcaster import broadcast_machine_state
from modules.machine_state.websocket_handler import MachinesWebsocketHandler
from modules.websockets.subscription_manager import SubscriptionManager

machine_broadcast_manager = SubscriptionManager(broadcast_data=broadcast_machine_state)
asyncio.create_task(machine_broadcast_manager.run_continuous_broadcast(1))

@app.websocket('/ws/vm')
async def machine_state_socket(websocket: WebSocket):
    websocketHandler = MachinesWebsocketHandler(websocket=websocket, subscription_manager=machine_broadcast_manager)
    
    await websocketHandler.accept()
    await websocketHandler.listen()