import { ActionIcon, Box, Button, Checkbox, Group, Pagination, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled, IconDotsVertical, IconFileImport, IconFilter, IconUserPlus } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import BuisnessCardCell from "../../atoms/table/BuisnessCardCell";
import DateDifferenceCell from "../../atoms/table/DateDifferenceCell";
import RolesCell from "../../atoms/table/RolesCell";
import classes from './AccountTable.module.css';
import TableSearch from "../../molecules/interactive/TableSearch/TableSearch";
import TableStateHeading from "../../molecules/feedback/TableStateHeading/TableStateHeading";
import DATA from './usersData.local.js';

const columns = [
    {
        accessorKey: 'selection',
        size: 20,
        enableSorting: false,
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={() => table.toggleAllRowsSelected()} 
                color='cherry'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              color='cherry'
            />
        ),
    },
    {
        accessorKey: 'details',
        header: 'Name',
        cell: BuisnessCardCell,
        sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
        filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
    },
    {
        accessorKey: 'roles',
        header: 'Roles',
        enableSorting: false,
        cell: RolesCell
    },
    {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: DateDifferenceCell,
    },
    {
        accessorKey: 'options',
        header: '',
        enableSorting: false,
        size: 20,
        cell: () => <ActionIcon variant="transparent" color='dimmed'><IconDotsVertical /></ActionIcon>
    }
]

const UsersTable = (): React.JSX.Element => {
    const [data, setData] = useState(DATA);
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10});

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination(prev => ({...prev, pageIndex: 0}));
    }

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            pagination
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading {...table}/>
                    <Group justify="flex-end">
                        <TableSearch 
                            id='details' 
                            setFilters={onFilteringChange} 
                            toggleAllRowsSelected={table.toggleAllRowsSelected}
                        />
                        <Button fw={400} w={100} variant="default" leftSection={<IconFilter size={16} />}>Filters</Button>
                        <Button fw={400} w={180} variant="default" leftSection={<IconFileImport size={16} />}>Import accounts</Button>
                        <Button w={180} variant="white" color="black" leftSection={<IconUserPlus size={16} stroke={3} />}>Create account</Button>
                    </Group>
                </Group>
                <Box className={classes.table} >
                    {table.getHeaderGroups().map(headerGroup =>
                        <Box className={classes.tr} key={headerGroup.id}>
                            {headerGroup.headers.map(header =>
                                <Box className={classes.th} key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && 
                                        <ActionIcon
                                            variant="transparent"
                                            onClick={header.column.getToggleSortingHandler()}
                                            color='dimmed'
                                            size='xs'
                                        >
                                            {{
                                                desc: <IconCaretDownFilled/>, 
                                                asc: <IconCaretUpFilled/>, 
                                                off: <IconCaretUpDown/>,
                                            }[header.column.getIsSorted() || 'off']}
                                            
                                        </ActionIcon>
                                    }
                                </Box>
                            )}
                        </Box>
                    )}
                    <ScrollArea className={classes.container}>
                        {table.getRowModel().rows.map(row =>
                            <Box className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ''}`} key={row.id}>
                                {row.getVisibleCells().map(cell =>
                                    <Box className={classes.td} key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </ScrollArea>
                </Box>
            </Stack>
            <Stack className={classes.bottom}>
                <Pagination 
                    value={pagination.pageIndex + 1} 
                    onChange={(val) => setPagination(prev => ({...prev, pageIndex: val - 1}))} 
                    total={table.getPageCount()} 
                    siblings={2} 
                    withEdges
                />
            </Stack>
        </Stack>
    );
}

export default UsersTable;