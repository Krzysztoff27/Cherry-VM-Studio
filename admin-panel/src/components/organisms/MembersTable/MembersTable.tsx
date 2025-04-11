import React, { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { safeObjectValues } from "../../../utils/misc";
import BusinessCardCell from "../../atoms/table/BusinessCardCell";
import { ActionIcon, Box, Button, ScrollArea, Stack } from "@mantine/core";
import { IconLinkOff } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import classes from "./MembersTable.module.css";
import AddMembersField from "../../molecules/interactive/AddMembersField/AddMembersField";
import useApi from "../../../hooks/useApi";

const MembersTable = ({ usersData, refresh, removeMember }): React.JSX.Element => {
    const data = useMemo(
        () =>
            usersData.map(({ uuid, name, surname, username, email }) => ({
                uuid,
                details: { name, surname, email, username },
            })),
        [usersData]
    );

    const columns = [
        {
            accessorKey: "details",
            header: "",
            cell: BusinessCardCell,
        },
        {
            accessorKey: "options",
            header: "",
            cell: ({ row }) => (
                <Button
                    color="cherry"
                    variant="light"
                    leftSection={<IconLinkOff size={16} />}
                    size="sm"
                    onClick={() => removeMember(row.id)}
                >
                    Remove user
                </Button>
            ),
        },
    ];

    const table = useReactTable({
        data: data,
        columns: columns,
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}></Stack>
            <Box className={classes.table}>
                {table.getHeaderGroups().map(headerGroup => (
                    <Box
                        className={classes.tr}
                        key={headerGroup.id}
                    >
                        {headerGroup.headers.map(header => (
                            <Box
                                className={classes.th}
                                key={header.id}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </Box>
                        ))}
                    </Box>
                ))}

                <ScrollArea scrollbars="y">
                    {table.getRowModel().rows.map(row => (
                        <Box
                            className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                            key={row.id}
                        >
                            {row.getVisibleCells().map(cell => (
                                <Box
                                    className={classes.td}
                                    key={cell.id}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </ScrollArea>
            </Box>
        </Stack>
    );
};

export default MembersTable;
