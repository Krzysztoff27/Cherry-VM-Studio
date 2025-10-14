import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconDisc, IconSettings } from "@tabler/icons-react";
import DateDifferenceCell from "../../../atoms/table/DateDifferenceCell";
import IsoFileOptionsMenu from "../../../molecules/table/IsoFileOptionsMenu/IsoFileOptionsMenu";
import { formatBytesToRelevantUnit } from "../../../../utils/files";

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
        accessorKey: "file_location",
        enableSorting: true,
        header: t("iso.table.headers.location", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue() || "Local"}</Text>,
        minSize: 300,
        maxSize: 400,
    },
    {
        accessorKey: "file_size_bytes",
        enableSorting: true,
        header: t("iso.table.headers.size", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{formatBytesToRelevantUnit(props.getValue())}</Text>,
        minSize: 120,
        maxSize: 120,
    },
    {
        accessorKey: "last_used",
        header: t("iso.table.headers.last-used", { ns: "pages" }),
        cell: DateDifferenceCell,
        minSize: 160,
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
