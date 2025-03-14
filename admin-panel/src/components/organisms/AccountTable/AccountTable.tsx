import { ActionIcon, Box, Group, Pagination, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import classes from "./AccountTable.module.css";
import TableStateHeading from "../../molecules/feedback/TableStateHeading/TableStateHeading";
import AccountTableControls from "../../molecules/interactive/AccountTableControls/AccountTableControls.jsx";
import useFetch from "../../../hooks/useFetch.js";
import { safeObjectValues } from "../../../utils/misc.js";
import { getColumns } from "./tableConfig.jsx";
import Loading from "../../atoms/feedback/Loading/Loading.jsx";
import SizeSelect from "../../atoms/interactive/SizeSelect/SizeSelect.jsx";

const AccountTable = ({ accountType }): React.JSX.Element => {
    const { data: userData, error, loading, refresh } = useFetch(`/users?account_type=${accountType}`);
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const columns = useMemo(() => getColumns(accountType, refresh), [accountType, refresh]);
    const data = useMemo(
        () =>
            safeObjectValues(userData).map(({ uuid, username, name, surname, email, groups = [] }) => ({
                uuid,
                groups,
                lastActive: null,
                details: { username, name, surname, email },
            })),
        [userData]
    );

    const table = useReactTable({
        data,
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

    const setPageSize = (size: number | string) => setPagination(prev => ({ ...prev, pageSize: parseInt(`${size}`) }));

    console.log(data);

    if (error) throw error;

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading {...table} />
                    <AccountTableControls
                        table={table}
                        accountType={accountType}
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

export default AccountTable;
