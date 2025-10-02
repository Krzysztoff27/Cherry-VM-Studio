import { WebSocketCommandMethods } from "./api.types";

export interface useFetchReturn {
    loading: boolean;
    error: Response | null;
    data: any | null;
    refresh: () => void;
}

interface Tokens {
    access_token: string | null;
    refresh_token: string | null;
}

export interface useAuthReturn {
    tokens: Tokens;
    authOptions: RequestInit | null;
    refreshOptions: RequestInit | null;
    logout: () => void;
    clearTokens: () => void;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

export interface useApiWebSocketReturn {
    setUrl: (path: string) => void;
    sendCommand: (method: WebSocketCommandMethods, data: object) => void;
    lastJsonMessage: any | null;
    connectionStatus: string;
}

export type ErrorCallbackFunction = (response: Response, json: { [x: string]: any }) => void | Promise<void>;

type HTMLRequestFunction = (relativePath: string, options?: RequestInit, errorCallback?: ErrorCallbackFunction) => Promise<any>;

type HTMLBodyRequestFunction = (relativePath: string, body?: BodyInit, options?: RequestInit, errorCallback?: ErrorCallbackFunction) => Promise<any>;

export interface useApiReturn {
    getPath: Function;
    getRequest: HTMLRequestFunction;
    postRequest: HTMLBodyRequestFunction;
    putRequest: HTMLBodyRequestFunction;
    deleteRequest: HTMLRequestFunction;
}

export interface sendNotificationProps {
    color?: string | null;
    loading?: boolean;
    uniqueId?: boolean;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";
