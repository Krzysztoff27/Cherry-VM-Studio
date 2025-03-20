import { ActionIcon, Button, Text } from "@mantine/core";
import AccountOptionsCell from "../../atoms/table/AccountOptionsCell";
import CheckboxCell from "../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../atoms/table/CheckboxHeader";
import AvatarsCell from "../../atoms/table/AvatarsCell";
import ModalButton from "../../atoms/interactive/ModalButton/ModalButton";
import GroupModal from "../../../modals/account/GroupModal/GroupModal";

export const getColumns = (refresh: () => void, openGroupModal: (uuid: string) => void) => [
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
            <Button
                variant="default"
                className="border"
                onClick={() => openGroupModal(row.id)}
            >
                View & Edit
            </Button>
        ),
    },
];
