import { ActionIcon, Text } from "@mantine/core";
import AccountOptionsCell from "../../atoms/table/AccountOptionsCell";
import CheckboxCell from "../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../atoms/table/CheckboxHeader";
import DateDifferenceCell from "../../atoms/table/DateDifferenceCell";
import { IconDotsVertical } from "@tabler/icons-react";
import AvatarsCell from "../../atoms/table/AvatarsCell";

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
        accessorKey: "users",
        header: "Users",
        cell: AvatarsCell,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: props => (
            <ActionIcon
                variant="transparent"
                color="dimmed"
                size="sm"
            >
                <IconDotsVertical />
            </ActionIcon>
        ),
    },
];
