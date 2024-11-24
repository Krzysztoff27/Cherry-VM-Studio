import { useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { validPath } from '../utils/misc.js';
import useAuth from "./useAuth.ts";
import { WebSocketCommandMethods } from "../types/api.types.ts";
import { useApiWebSocketReturn } from "../types/hooks.types.ts";

const useApiWebSocket = (path: string) : useApiWebSocketReturn => {
    const API_WEBSOCKET_URL: string = import.meta.env.VITE_API_WEBSOCKET_URL;
    const getUrl = (path: string) => `${API_WEBSOCKET_URL}${validPath(path)}`;

    const [socketUrl, setSocketUrl] = useState(getUrl(path));
    const setUrl = (path: string) => setSocketUrl(getUrl(path));

    const { token } = useAuth();
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: 'CONNECTING',
        [ReadyState.OPEN]: 'OPEN',
        [ReadyState.CLOSING]: 'CLOSING',
        [ReadyState.CLOSED]: 'CLOSED',
        [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED',
    }[readyState];

    
    const sendCommand = (method: WebSocketCommandMethods, data: object) : void => sendJsonMessage({
        method: method,
        uuid: uuidv4(),
        auth_token: token,
        ...data,
    })

    return {
        setUrl,
        lastJsonMessage,
        sendCommand,
        connectionStatus
    }
}

export default useApiWebSocket;