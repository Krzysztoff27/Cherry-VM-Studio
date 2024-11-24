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