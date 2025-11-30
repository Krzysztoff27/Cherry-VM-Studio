import { NumberFormatterFactory } from "@mantine/core";
import { AccountType } from "./config.types";

export interface TokenRequestForm {
    username: string;
    password: string;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export type MachineStates = "online" | "offline" | "loading" | "fetching";

export type ConnectionStatuses = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "UNINSTANTIATED";

export type WebSocketResponseMethods = "ACKNOWLEDGE" | "REJECT" | "DATA";

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
    permissions?: number;
}

// machines

export type MachineDiskTypes = "raw" | "qcow2" | "qed" | "qcow" | "luks" | "vdi" | "vmdk" | "vpc" | "vhdx";

export interface MachineDisk {
    name: string;
    size_bytes: number;
    type: MachineDiskTypes;
}

export interface MachineDiskStaticData extends MachineDisk {
    system: boolean;
}

export interface MachineDiskDynamicData extends MachineDiskStaticData {
    occupied_bytes: number;
}

export interface MachineDiskForm {
    name: string;
    size: number;
    unit: "MiB" | "GiB";
    type: MachineDiskTypes;
}

export type MachineConnectionProtocols = "vnc" | "ssh" | "rdp";

export interface MachineData {
    uuid: string;
    title: string;
    tags: string[];
    description: string;
    owner: UserInDB | null;
    assigned_clients: Record<string, UserInDB>;
    domain: string | null;
    ras_ip: string | null;
    ras_port: number | null;
    connections: {
        vnc?: string;
        rdp?: string;
        ssh?: string;
    };
    disks: MachineDiskStaticData[];
}

export interface MachineState extends MachineData {
    active: boolean;
    loading: boolean;
    active_connections?: Array<string> | null;
    cpu?: number;
    vcpu: number;
    ram_used?: number;
    ram_max?: number;
    boot_timestamp: string | null;
    disks: MachineDiskDynamicData[];
}

export interface SimpleState {
    fetching: boolean;
    loading: boolean;
    active: boolean;
}

export type MachineAll = MachineData | MachineState;

export interface CreateMachineBody {
    title: string;
    description: string;
    tags: string[];
    assigned_clients: string[];
    source_type: "iso" | "snapshot";
    source_uuid: string;
    config: {
        ram: number;
        vcpu: number;
    };
    disks: MachineDisk[];
    os_disk: number;
}

export interface IsoRecord {
    uuid: string;
    name: string;
    remote: boolean;
    file_name: string;
    file_location?: string;
    file_size_bytes: number;
    last_used?: string;
    imported_at?: string;
    last_modified_at?: string;
    imported_by?: User;
    last_modified_by?: User;
}

// libraries

export interface IsoFile {
    uuid: string;
    name: string;
    remote: boolean | null;
    file_location: string | null;
    file_size_bytes: number;
    last_used: string | null;
    imported_at: string | null;
    imported_by: User | null;
    last_modified_at: string | null;
    last_modified_by: User | null;
}

export interface MachineSnapshot {
    [x: string]: any;
}

export interface MachineTemplate {
    name: string;
    ram: number;
    vcpu: number;
    owner: UserInDB;
    created_at: string;
}
