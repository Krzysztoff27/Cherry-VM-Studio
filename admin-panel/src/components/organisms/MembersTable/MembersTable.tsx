import React, { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { safeObjectValues } from "../../../utils/misc";
import BusinessCardCell from "../../atoms/table/BusinessCardCell";
import { ActionIcon, Box, Button, Group, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled, IconLinkOff } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import classes from "./MembersTable.module.css";
import TableSearch from "../../molecules/interactive/TableSearch/TableSearch";

const MembersTable = ({ usersData, refresh }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls");
    const [columnFilters, setColumnsFilters] = useState([]);

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
    };

    const data = useMemo(
        () =>
            safeObjectValues(usersData).map(({ uuid, name, surname, username, email }) => ({
                uuid,
                details: { name, surname, email, username },
            })),
        [usersData]
    );

    const columns = [
        {
            accessorKey: "details",
            header: "Name",
            cell: BusinessCardCell,
            sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        },
        {
            accessorKey: "options",
            header: "",
            enableSorting: false,
            cell: props => (
                <ActionIcon
                    color="cherry"
                    variant="light"
                >
                    <IconLinkOff />
                </ActionIcon>
            ),
        },
    ];

    const table = useReactTable({
        data: data,
        columns: columns,
        state: {
            columnFilters,
        },
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="end">
                    <TableSearch
                        id="details"
                        setFilters={onFilteringChange}
                        toggleAllRowsSelected={table.toggleAllRowsSelected}
                        maw="300"
                        miw="100px"
                        flex="1"
                    />
                    <Button
                        w={120}
                        variant="default"
                    >
                        Add User
                    </Button>
                </Group>
            </Stack>
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
                                {header.column.getCanSort() && (
                                    <ActionIcon
                                        variant="transparent"
                                        onClick={header.column.getToggleSortingHandler()}
                                        color="dimmed"
                                        size="xs"
                                    >
                                        {
                                            {
                                                desc: <IconCaretDownFilled />,
                                                asc: <IconCaretUpFilled />,
                                                off: <IconCaretUpDown />,
                                            }[header.column.getIsSorted() || "off"]
                                        }
                                    </ActionIcon>
                                )}
                            </Box>
                        ))}
                    </Box>
                ))}

                <ScrollArea
                    scrollbars="y"
                    offsetScrollbars
                >
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
