import { useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import {validPath} from '../utils/misc.js';
import useAuth from "./useAuth.jsx";

const useApiWebSocket = (path) => {
    const API_WEBSOCKET_URL = import.meta.env.VITE_API_WEBSOCKET_URL;
    const getUrl = (path) => `${API_WEBSOCKET_URL}${validPath(path)}`;

    const [socketUrl, setSocketUrl] = useState(getUrl(path));
    const setUrl = (path) => setSocketUrl(getUrl(path));

    const { token } = useAuth();
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    /**
     * Sends command to the server
     * @param {("SUBSCRIBE"|"UNSUBSCRIBE"|"START"|"STOP"|"UPDATE")} method 
     * @param {Object} data - additional data for the command
     * @returns 
     */
    const sendCommand = (method, data) => sendJsonMessage({
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