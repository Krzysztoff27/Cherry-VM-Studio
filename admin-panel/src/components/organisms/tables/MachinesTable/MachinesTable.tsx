import { ActionIcon, Box, Group, ScrollArea, Stack } from "@mantine/core";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TableStateHeading from "../../../molecules/feedback/TableStateHeading/TableStateHeading";
import TablePagination from "../../../molecules/interactive/TablePagination/TablePagination";
import classes from "./MachinesTable.module.css";
import { getColumns, parseData } from "./tableConfig";
import { Link } from "react-router-dom";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import TableControls from "../../../molecules/interactive/TableControls/TableControls";
import usePermissions from "../../../../hooks/usePermissions";
import PERMISSIONS from "../../../../config/permissions.config";

const MachinesTable = ({ machines, loading, refresh, error, global }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const columns = useMemo(() => getColumns(refresh, global, viewMode), [global, viewMode]);
    const data = useMemo(() => parseData(machines), [machines, viewMode]);

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

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading
                        {...table}
                        loading={loading}
                        translations={{
                            all: tns(global ? "all-machines" : "your-machines"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        modals={{}}
                        translations={{
                            create: tns("create-machine"),
                            filter: tns("filters"),
                        }}
                        viewMode={viewMode}
                        withImports={false}
                        onFilteringChange={onFilteringChange}
                    />
                </Group>
            </Stack>
            {/* here we dont use <TanstackTableBody> cause we need to modify the rows for them to be links ;-; */}
            <ScrollArea
                className={classes.table}
                scrollbars="x"
                offsetScrollbars
            >
                {table.getHeaderGroups().map(headerGroup => (
                    <Box
                        className={classes.tr}
                        key={headerGroup.id}
                    >
                        {headerGroup.headers.map(header => (
                            <Box
                                className={classes.th}
                                key={header.id}
                                style={{
                                    flexBasis: header.getSize(),
                                    flexGrow: 1, // allows to grow and fill available space
                                    flexShrink: 0, // optional: don't shrink below minSize
                                    minWidth: header.column.columnDef.minSize,
                                    maxWidth: header.column.columnDef.maxSize,
                                }}
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

                {!loading && !error && (
                    <ScrollArea
                        scrollbars="y"
                        offsetScrollbars
                    >
                        {table.getRowModel().rows.map(row => (
                            <Link
                                to={`/machines/${row.id}`}
                                key={row.id}
                                className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <Box
                                        className={classes.td}
                                        key={cell.id}
                                        style={{
                                            flexBasis: cell.column.getSize(),
                                            flexGrow: 1,
                                            flexShrink: 0,
                                            minWidth: cell.column.columnDef.minSize,
                                            maxWidth: cell.column.columnDef.maxSize,
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Box>
                                ))}
                            </Link>
                        ))}
                    </ScrollArea>
                )}
            </ScrollArea>
            <TablePagination
                pagination={pagination}
                setPagination={setPagination}
                getPageCount={table.getPageCount}
            />
        </Stack>
    );
};

export default MachinesTable;
