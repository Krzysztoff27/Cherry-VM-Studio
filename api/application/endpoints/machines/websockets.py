import asyncio
from modules.websockets.subscription_manager import SubscriptionManager
from modules.machine_state.websockets.all_machines.websocket_handler import AllMachinesWebsocketHandler
from modules.machine_state.websockets.user_machines.websocket_handler import UserMachinesWebsocketHandler
from modules.machine_state.websockets.all_machines.websocket_broadcaster import broadcast_all_machines_state
from modules.machine_state.websockets.user_machines.websocket_broadcaster import broadcast_user_machines_state
from modules.machine_state.websockets.subscribed_machines.websocket_broadcaster import broadcast_subscribed_machines_state
from modules.machine_state.websockets.subscribed_machines.websocket_handler import SubscribedMachinesWebsocketHandler
from application.app import app
from fastapi import WebSocket


BROADCAST_COOLDOWN_SECONDS = 1

subscribed_machines_broadcast_manager = SubscriptionManager(broadcast_data=broadcast_subscribed_machines_state)
subscribed_accounts_manager = SubscriptionManager(broadcast_data=broadcast_user_machines_state)
subscribed_all_machines_broadcast_manager = SubscriptionManager(broadcast_data=broadcast_all_machines_state)

asyncio.create_task(subscribed_machines_broadcast_manager.run_continuous_broadcast(BROADCAST_COOLDOWN_SECONDS))
asyncio.create_task(subscribed_accounts_manager.run_continuous_broadcast(BROADCAST_COOLDOWN_SECONDS))
asyncio.create_task(subscribed_all_machines_broadcast_manager.run_continuous_broadcast(BROADCAST_COOLDOWN_SECONDS))


@app.websocket('/ws/machines/subscribed')
async def __subscribed_machines_state_websocket__(websocket: WebSocket, access_token: str):
    websocket_handler = SubscribedMachinesWebsocketHandler(websocket=websocket, subscription_manager=subscribed_machines_broadcast_manager)
    
    await websocket_handler.accept(access_token)
    await websocket_handler.listen()
    
    
@app.websocket('/ws/machines/account')
async def __user_machines_state_websocket__(websocket: WebSocket, access_token: str):
    websocket_handler = UserMachinesWebsocketHandler(websocket=websocket, subscription_manager=subscribed_accounts_manager)
    
    await websocket_handler.accept(access_token)
    await websocket_handler.listen()

    
    
@app.websocket('/ws/machines/global')
async def __all_machines_state_websocket__(websocket: WebSocket, access_token: str):
    websocket_handler = AllMachinesWebsocketHandler(websocket=websocket, subscription_manager=subscribed_all_machines_broadcast_manager)
    
    await websocket_handler.accept(access_token)
    await websocket_handler.listen()

    
    



