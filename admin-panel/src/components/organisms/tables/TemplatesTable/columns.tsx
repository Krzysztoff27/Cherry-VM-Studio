import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { ActionIcon, Group, Text } from "@mantine/core";
import BusinessCardCell, { filterFunction, sortingFunction } from "../../../atoms/table/BusinessCardCell";
import { IconDisc, IconFileSettings, IconSettings, IconTemplate } from "@tabler/icons-react";

export const getColumns = (openTemplateModal: (uuid: string) => void) => [
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
        header: t("snapshots.table.headers.name", { ns: "pages" }),
        cell: (props) => (
            <Group gap="xs">
                <IconFileSettings size="28" /> {props.getValue()}
            </Group>
        ),
        minSize: 300,
        maxSize: 400,
    },
    {
        accessorKey: "created",
        enableSorting: true,
        header: t("snapshots.table.headers.creation-date", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue()}</Text>,
        minSize: 100,
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
                onClick={() => openTemplateModal(row?.id)}
            >
                <IconSettings />
            </ActionIcon>
        ),
        minSize: 50,
        maxSize: 50,
    },
];
