import { WebSocketCommandMethods } from "./api.types";

export interface useApiWebSocketReturn {
    setUrl: (path: string) => void;
    sendCommand: (method: WebSocketCommandMethods, data: object) => void;
    lastJsonMessage: any | null;
    connectionStatus: string;
}

export type ErrorCallbackFunction = (response: Response, json: { [x: string]: any }) => void | Promise<void>;

type HTMLRequestFunction = (relativePath: string, options?: RequestInit, errorCallback?: ErrorCallbackFunction) => Promise<any>;

type HTMLBodyRequestFunction = (relativePath: string, body?: BodyInit, options?: RequestInit, errorCallback?: ErrorCallbackFunction) => Promise<any>;
