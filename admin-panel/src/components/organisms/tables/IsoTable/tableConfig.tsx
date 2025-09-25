import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconDisc, IconSettings } from "@tabler/icons-react";
import DateDifferenceCell from "../../../atoms/table/DateDifferenceCell";
import IsoFileOptionsMenu from "../../../molecules/table/IsoFileOptionsMenu/IsoFileOptionsMenu";

export const getColumns = (refresh, openIsoFileModal) => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
        maxSize: 50,
    },
    {
        accessorKey: "name",
        enableSorting: true,
        header: t("iso.table.headers.name", { ns: "pages" }),
        cell: (props) => (
            <Group gap="xs">
                <IconDisc size="28" /> {props.getValue()}
            </Group>
        ),
        minSize: 200,
        maxSize: 300,
    },
    {
        accessorKey: "location",
        enableSorting: true,
        header: t("iso.table.headers.location", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue()}</Text>,
        minSize: 300,
        maxSize: 400,
    },
    {
        accessorKey: "size",
        enableSorting: true,
        header: t("iso.table.headers.size", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue()}</Text>,
        minSize: 120,
        maxSize: 120,
    },
    {
        accessorKey: "lastUsed",
        header: t("iso.table.headers.last-used", { ns: "pages" }),
        cell: DateDifferenceCell,
        minSize: 160,
        maxSize: 160,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
            <ActionIcon
                variant="transparent"
                color="white"
                size="sm"
                onClick={() => openIsoFileModal(row?.id)}
            >
                <IconSettings />
            </ActionIcon>
        ),
        minSize: 50,
        maxSize: 50,
    },
];
