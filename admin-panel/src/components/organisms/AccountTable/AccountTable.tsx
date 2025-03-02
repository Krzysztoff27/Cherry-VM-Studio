import { ActionIcon, Box, Button, Group, Pagination, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled, IconFileImport, IconFilter, IconTrash, IconUserPlus } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import classes from './AccountTable.module.css';
import TableSearch from "../../molecules/interactive/TableSearch/TableSearch";
import TableStateHeading from "../../molecules/feedback/TableStateHeading/TableStateHeading";
import CreateAccountModal from "../../molecules/modals/CreateAccountModal/CreateAccountModal.jsx";
import ModalButton from "../../atoms/interactive/ModalButton/ModalButton.jsx";
import ExpandingButton from "../../atoms/interactive/ExpandingButton/ExpandingButton.jsx";
import DeleteAccountsModal from "../../molecules/modals/DeleteAccountsModal/DeleteAccountsModal.jsx";

const AccountTable = ({ columns, accountData, accountType }): React.JSX.Element => {
    const [data, setData] = useState(accountData);
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            pagination
        },
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const anyRowsSelected = () => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading {...table} />
                    <Group justify="flex-end">
                        <TableSearch
                            id='details'
                            setFilters={onFilteringChange}
                            toggleAllRowsSelected={table.toggleAllRowsSelected}
                        />
                        <Button fw={400} w={100} variant="default" leftSection={<IconFilter size={16} />}>Filters</Button>
                        <Button fw={400} w={180} variant="default" leftSection={<IconFileImport size={16} />}>Import accounts</Button>
                        <ModalButton
                            ButtonComponent={ExpandingButton}
                            ModalComponent={DeleteAccountsModal}
                            modalProps={{
                                uuids: table.getSelectedRowModel().rows.map(row => row.id)
                            }}
                            mounted={anyRowsSelected()}
                            w={180}
                            parentGap='1rem'
                            variant="filled"
                            color="cherry.9"
                            leftSection={<IconTrash size={16} stroke={3} />}
                        >
                                Delete selected
                        </ModalButton>
                        <ModalButton
                            ModalComponent={CreateAccountModal}
                            modalProps={{ accountType }}
                            w={180}
                            color="black"
                            variant="white"
                            leftSection={<IconUserPlus size={16} stroke={3} />}
                        >
                            Create account
                        </ModalButton>

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
                                                desc: <IconCaretDownFilled />,
                                                asc: <IconCaretUpFilled />,
                                                off: <IconCaretUpDown />,
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
                    onChange={(val) => setPagination(prev => ({ ...prev, pageIndex: val - 1 }))}
                    total={table.getPageCount()}
                    siblings={2}
                    withEdges
                />
            </Stack>
        </Stack>
    );
}

export default AccountTable;