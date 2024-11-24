import { ConnectionStatuses, WebSocketCommandMethods, WebSocketResponse } from "./api.types";

export interface useFetchReturn {
    loading: boolean;
    error: Error | Response | null;
    data: object | null;
    refresh: () => void;
}

export interface useAuthReturn {
    token: string | null;
    authOptions: object | null;
    setToken: Function;
    logout: Function;
}


export interface useApiWebSocketReturn {
    setUrl: (path: string) => void;
    sendCommand: (method: WebSocketCommandMethods, data: object) => void;
    lastJsonMessage: any | null,
    connectionStatus: string;
}

export interface useApiReturn {
    getPath: Function;
    getRequest: Function;
    postRequest: Function;
    putRequest: Function
    deleteRequest: Function;
}