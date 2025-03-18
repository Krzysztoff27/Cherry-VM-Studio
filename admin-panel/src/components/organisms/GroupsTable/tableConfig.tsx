import { Text } from "@mantine/core";
import CheckboxCell from "../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../atoms/table/CheckboxHeader";
import AvatarsCell from "../../atoms/table/AvatarsCell";
import ModalButton from "../../atoms/interactive/ModalButton/ModalButton";
import GroupModal from "../../../modals/account/GroupModal/GroupModal";

export const getColumns = (refresh: () => void) => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: props => <Text>{props.getValue()}</Text>,
    },
    {
        accessorKey: "count",
        header: "Client count",
        cell: props => <Text>{props.getValue()}</Text>,
    },
    {
        accessorKey: "users",
        enableSorting: false,
        header: "Clients",
        cell: AvatarsCell,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
            <ModalButton
                ModalComponent={GroupModal}
                buttonProps={{ variant: "default", bd: "2px var(--mantine-color-dark-5) solid" }}
                modalProps={{ uuid: row.id }}
            >
                View & Edit
            </ModalButton>
        ),
    },
];
