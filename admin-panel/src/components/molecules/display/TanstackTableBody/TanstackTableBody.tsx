import { ActionIcon, Box, ScrollArea } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import classes from "./TanstackTableBody.module.css";
import cs from "classnames";

export interface TanstackTableBodyProps {
    table: Table<any>;
    loading: boolean;
    error: Response | null;
    RowComponent?: React.ReactElement;
    rowProps?: (uuid: string) => Record<string, any>;
}

const TanstackTableBody = ({ table, loading, error, RowComponent, rowProps }): React.JSX.Element => {
    RowComponent = RowComponent || Box;

    return (
        <ScrollArea
            className={cs(classes.table, "mantine-ScrollArea-content-auto-width")}
            scrollbars="xy"
            offsetScrollbars
        >
            {table.getHeaderGroups().map((headerGroup) => (
                <Box
                    className={classes.tr}
                    key={headerGroup.id}
                >
                    {headerGroup.headers.map((header) => (
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

            {!loading &&
                !error &&
                table.getRowModel().rows.map((row) => (
                    <RowComponent
                        className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                        key={row.id}
                        {...rowProps?.(row.id)}
                    >
                        {row.getVisibleCells().map((cell) => (
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
                    </RowComponent>
                ))}
        </ScrollArea>
    );
};

export default TanstackTableBody;
