import asyncio
from application import app
from fastapi import WebSocket
from application.machines.websocket_broadcaster import broadcast_machine_state
from application.machines.websocket_handler import MachinesWebsocketHandler
from application.websockets.subscription_manager import SubscriptionManager

machine_broadcast_manager = SubscriptionManager(broadcast_data=broadcast_machine_state)
asyncio.create_task(machine_broadcast_manager.run_continuous_broadcast(1))

@app.websocket('/ws/vm')
async def machine_state_socket(websocket: WebSocket):
    websocketHandler = MachinesWebsocketHandler(websocket=websocket, subscription_manager=machine_broadcast_manager)
    
    await websocketHandler.accept()
    await websocketHandler.listen()