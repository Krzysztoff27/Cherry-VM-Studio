import { values } from "lodash";
import { Machine } from "../../../../pages/NetworkPanel/NetworkPanel";
import { MachineState } from "../../../../types/api.types";

export const parseData = (machines: Record<string, MachineState>) =>
    values(machines).map((machine) => {
        const name = `${machine.group} ${machine.group_member_id}`;
        const state = { fetching: machine.active === undefined, loading: machine.loading, active: machine.active };

        return {
            uuid: machine.uuid,
            details: { name, state },
            state: state,
            cpu: machine.cpu,
            ram: Math.round((machine.ram_used / machine.ram_max) * 100),
            owner: [machine.owner],
            clients: values(machine.assigned_clients),
            options: { state, uuid: machine.uuid },
        };
    });
