import { useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";
import { useApiWebSocketReturn } from "../types/hooks.types.ts";
import urlConfig from "../config/url.config.ts";
import { useAuthentication } from "../contexts/AuthenticationContext.tsx";
import { validPath } from "../utils/path.ts";

const useApiWebSocket = (path: string): useApiWebSocketReturn => {
    const API_WEBSOCKET_URL: string = urlConfig.api_websockets;
    const getUrl = (path: string) => `${API_WEBSOCKET_URL}${validPath(path)}`;

    const [socketUrl, setSocketUrl] = useState(getUrl(path));
    const setUrl = (path: string) => setSocketUrl(getUrl(path));

    const { tokens } = useAuthentication();
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: "CONNECTING",
        [ReadyState.OPEN]: "OPEN",
        [ReadyState.CLOSING]: "CLOSING",
        [ReadyState.CLOSED]: "CLOSED",
        [ReadyState.UNINSTANTIATED]: "UNINSTANTIATED",
    }[readyState];

    const sendCommand = (method: string, data: object): void =>
        sendJsonMessage({
            method: method,
            uuid: uuidv4(),
            access_token: tokens.access_token,
            ...data,
        });

    return {
        setUrl,
        lastJsonMessage,
        sendCommand,
        connectionStatus,
    };
};

export default useApiWebSocket;
