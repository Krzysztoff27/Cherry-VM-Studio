export type MachineStates = 'online' | 'offline' | 'loading' | 'fetching';

export interface MachineData {
    uuid: string,
    group: string,
    group_member_id: number,
    domain: string,
    port: number,
}

export interface MachineState {
    uuid: string,
    active: boolean,
    loading: boolean,
    cpu?: number,
    ram_used?: number,
    ram_max?: number,
    active_connections?: Array<string> | null,
}

export type MachineAll = MachineData | MachineState;

export type ConnectionStatuses = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED'; 

export type WebSocketCommandMethods = 'START' | 'STOP' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'UPDATE';
export type WebSocketResponseMethods = 'ACKNOWLEDGE' | 'REJECT' | 'LOADING_START' | 'LOADING_FIN' | 'DATA';

export interface WebSocketCommand {
    method: WebSocketCommandMethods,
    access_token?: string,
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

