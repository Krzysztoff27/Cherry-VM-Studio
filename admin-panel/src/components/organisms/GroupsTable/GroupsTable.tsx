import { ActionIcon, Box, Group, Pagination, ScrollArea, Stack, Title } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import classes from "./GroupsTable.module.css";
import useFetch from "../../../hooks/useFetch.js";
import { getColumns } from "./tableConfig.jsx";
import Loading from "../../atoms/feedback/Loading/Loading.jsx";
import { safeObjectValues } from "../../../utils/misc.js";
import GroupTableControls from "../../molecules/interactive/GroupTableControls/GroupTableControls.jsx";
import SizeSelect from "../../atoms/interactive/SizeSelect/SizeSelect.jsx";

const GroupsTable = (): React.JSX.Element => {
    const { data: groupsData, error, loading, refresh } = useFetch(`/groups`);
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const data = useMemo(() => safeObjectValues(groupsData), [groupsData]);
    const columns = useMemo(() => getColumns(refresh), [refresh]);

    const table = useReactTable({
        data: data,
        columns: columns,
        state: {
            columnFilters,
            pagination,
        },
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    console.log(data);
    if (error) throw error;

    const setPageSize = (size: number | string) => setPagination(prev => ({ ...prev, pageSize: parseInt(`${size}`) }));

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <Group>
                        <Title order={2}>All groups</Title>
                        <Title
                            order={2}
                            c="dimmed"
                        >
                            {table.getRowCount()}
                        </Title>
                    </Group>
                    <GroupTableControls
                        table={table}
                        onFilteringChange={onFilteringChange}
                        refreshData={refresh}
                    />
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
                {loading ? (
                    <Loading />
                ) : (
                    <ScrollArea className={classes.container}>
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
                )}
            </Box>
            <Stack className={classes.bottom}>
                <Group
                    justify="space-between"
                    w="100%"
                >
                    <Box w="50" />
                    <Pagination
                        value={pagination.pageIndex + 1}
                        onChange={val => setPagination(prev => ({ ...prev, pageIndex: val - 1 }))}
                        total={table.getPageCount() || 1}
                        siblings={2}
                        withEdges
                    />
                    <SizeSelect
                        value={pagination.pageSize}
                        setValue={setPageSize}
                        sizes={[1, 5, 10, 25, 50]}
                    />
                </Group>
            </Stack>
        </Stack>
    );
};

export default GroupsTable;
