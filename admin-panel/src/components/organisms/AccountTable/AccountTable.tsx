import { ActionIcon, Box, Group, Pagination, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import classes from "./AccountTable.module.css";
import TableStateHeading from "../../molecules/feedback/TableStateHeading/TableStateHeading";
import useFetch from "../../../hooks/useFetch.js";
import { safeObjectValues } from "../../../utils/misc.js";
import { getColumns } from "./tableConfig.jsx";
import Loading from "../../atoms/feedback/Loading/Loading.jsx";
import TableControls from "../../molecules/interactive/TableControls/TableControls.jsx";
import CreateAccountModal from "../../../modals/account/CreateAccountModal/CreateAccountModal.jsx";
import DeleteAccountsModal from "../../../modals/account/DeleteAccountsModal/DeleteAccountsModal.jsx";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation.js";

const AccountTable = ({ accountType, userData, refresh, error, loading }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls.");
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const onDelete = () => {
        refresh();
        table.toggleAllRowsSelected(false);
    };

    const selectedUuids = table.getSelectedRowModel().rows.map(row => row.id);

    if (error) throw error;

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading
                        {...table}
                        translations={{
                            all: tns("all-accounts"),
                            selected: tns("selected-accounts"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        modals={{
                            create: {
                                component: CreateAccountModal,
                                props: { accountType, onSubmit: refresh },
                            },
                            delete: {
                                component: DeleteAccountsModal,
                                props: { uuids: selectedUuids, onSubmit: onDelete },
                            },
                        }}
                        translations={{
                            create: tns("create-account"),
                            delete: tns("delete-selected"),
                            import: tns("import"),
                            filter: tns("filters"),
                        }}
                        onFilteringChange={onFilteringChange}
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
                )}
            </Box>
            <Stack className={classes.bottom}>
                <Pagination
                    value={pagination.pageIndex + 1}
                    onChange={val => setPagination(prev => ({ ...prev, pageIndex: val - 1 }))}
                    total={table.getPageCount() || 1}
                    siblings={2}
                    withEdges
                />
            </Stack>
        </Stack>
    );
};

export default AccountTable;
