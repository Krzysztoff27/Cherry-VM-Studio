import { AccountType } from "./config.types";

export interface TokenRequestForm {
    username: string;
    password: string;
}

export type MachineStates = "online" | "offline" | "loading" | "fetching";

export type ConnectionStatuses = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "UNINSTANTIATED";

export type WebSocketResponseMethods = "ACKNOWLEDGE" | "REJECT" | "LOADING_START" | "LOADING_FIN" | "DATA";

export interface WebSocketCommand {
    method: string;
    access_token?: string;
    uuid: string | null;
    target?: string;
}

export interface WebSocketResponse {
    method: WebSocketResponseMethods;
    uuid: string;
    command?: WebSocketCommand;
    body?: object;
}

export interface ErrorResponseBody {
    detail?: string;
    [x: string]: any;
}

// users related

export interface UserInDB {
    uuid: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    creation_date: string;
    last_active: string;
    disabled: boolean;
}

export interface GroupInDB {
    uuid: string;
    name: string;
}

export interface RoleInDB {
    uuid: string;
    name: string;
    permissions: number;
}

export interface Group extends GroupInDB {
    users: UserInDB[];
}

export interface User extends UserInDB {
    account_type: AccountType;
    roles?: RoleInDB[];
    groups?: GroupInDB[];
    permissions: number;
}

export interface MachineData {
    uuid: string;
    group: string;
    group_member_id: number;
    owner: UserInDB;
    assigned_clients: { [uuid: string]: UserInDB };
    domain: string;
    port: number;
}

export interface MachineState {
    uuid: string;
    active: boolean;
    loading: boolean;
    cpu?: number;
    ram_used?: number;
    ram_max?: number;
    active_connections?: Array<string> | null;
}

export type MachineAll = MachineData | MachineState;
