import { ActionIcon, Box, Group, Pagination, ScrollArea, Stack } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import classes from "./GroupsTable.module.css";
import { getColumns } from "./tableConfig.jsx";
import Loading from "../../atoms/feedback/Loading/Loading.jsx";
import { safeObjectValues } from "../../../utils/misc.js";
import TableControls from "../../molecules/interactive/TableControls/TableControls.jsx";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation.js";
import TableStateHeading from "../../molecules/feedback/TableStateHeading/TableStateHeading.jsx";
import CreateGroupModal from "../../../modals/account/CreateGroupModal/CreateGroupModal.jsx";
import DeleteGroupsModal from "../../../modals/account/DeleteGroupsModal/DeleteGroupsModal.jsx";

const GroupsTable = ({ userData, groupData, error, loading, refresh }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls");

    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const data = useMemo(
        () =>
            safeObjectValues(groupData).map(({ uuid, name, users }) => ({
                uuid,
                name,
                count: users.length,
                users: users.map((uuid: string) => userData?.[uuid] || { uuid: "loading", username: "?" }),
            })),
        [groupData, userData]
    );

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
                            all: tns("all-groups"),
                            selected: tns("selected-groups"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        onFilteringChange={onFilteringChange}
                        modals={{
                            create: {
                                component: CreateGroupModal,
                                props: { onSubmit: refresh },
                            },
                            delete: {
                                component: DeleteGroupsModal,
                                props: { uuids: selectedUuids, onSubmit: onDelete },
                            },
                        }}
                        translations={{
                            create: tns("create-group"),
                            delete: tns("delete-selected"),
                            filter: tns("filters"),
                            import: tns("import"),
                        }}
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

export default GroupsTable;
