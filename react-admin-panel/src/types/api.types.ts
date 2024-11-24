export type ConnectionStatuses = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED'; 

export type WebSocketCommandMethods = 'START' | 'STOP' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'UPDATE';
export type WebSocketResponseMethods = 'ACKNOWLEDGE' | 'REJECT' | 'LOADING_START' | 'LOADING_FIN' | 'DATA';

export interface WebSocketCommand {
    method: WebSocketCommandMethods,
    auth_token?: string,
    uuid: string | null,
    target?: string,
}

export interface WebSocketResponse {
    method: WebSocketResponseMethods,
    uuid: string,
    command?: WebSocketCommand,
    body?: object,
}

export interface ErrorResponseBody {
    detail?: string,
    [x: string]: any,
}

