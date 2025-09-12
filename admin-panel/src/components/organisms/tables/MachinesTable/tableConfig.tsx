import { t } from "i18next";
import MachineDetailsCell from "../../../atoms/table/MachineDetailsCell";
import MachineStateCell from "../../../atoms/table/MachineStateCell";
import ProgressWithPercentage from "../../../atoms/feedback/ProgressWithPercentage/ProgressWithPercentage";
import MachineControlsCell from "../../../atoms/table/MachineControlsCell";
import MachineAssignedUserCell from "../../../atoms/table/MachineAssignedUserCell";
import { safeObjectValues } from "../../../../utils/misc";

export const parseData = (machines) =>
    safeObjectValues(machines).map((machine) => {
        const name = `${machine.group} ${machine.group_member_id}`;
        const state = { fetching: machine.active === undefined, loading: machine.loading, active: machine.active };

        return {
            uuid: machine.uuid,
            details: { name, state },
            state: { state, uuid: machine.uuid },
            cpu: machine.cpu,
            ram: Math.round((machine.ram_used / machine.ram_max) * 100),
            owner: [machine.owner],
            clients: safeObjectValues(machine.assigned_clients),
            options: state,
        };
    });

export const getColumns = (refresh: () => void, global: boolean, viewMode: boolean) =>
    [
        {
            accessorKey: "details",
            header: t("machines.table.headers.name", { ns: "pages" }),
            cell: MachineDetailsCell,
            minSize: 200,
            maxSize: 260,
            sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        },

        {
            accessorKey: "state",
            header: t("machines.table.headers.state", { ns: "pages" }),
            enableSorting: false,
            cell: MachineStateCell,
            minSize: 150,
            maxSize: 230,
        },
        !global && {
            accessorKey: "ram",
            header: t("machines.table.headers.ram", { ns: "pages" }),
            cell: ({ getValue }) => (
                <ProgressWithPercentage
                    value={getValue()}
                    transitionDuration={200}
                    w="65%"
                    size="sm"
                />
            ),
            minSize: 160,
            maxSize: 300,
        },

        global && {
            accessorKey: "owner",
            header: t("machines.table.headers.owner", { ns: "pages" }),
            cell: MachineAssignedUserCell,
            minSize: 200,
            maxSize: 500,
        },
        {
            accessorKey: "clients",
            header: t("machines.table.headers.assigned-clients", { ns: "pages" }),
            cell: MachineAssignedUserCell,
            minSize: 200,
            maxSize: 500,
        },
        {
            accessorKey: "options",
            header: "",
            enableSorting: false,
            cell: ({ getValue }) => (
                <MachineControlsCell
                    disabled={viewMode}
                    {...getValue()}
                />
            ),
            minSize: 350,
            maxSize: 350,
        },
    ].filter((e) => e);
