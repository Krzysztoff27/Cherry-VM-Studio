import { ActionIcon, Box, ScrollArea } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender } from "@tanstack/react-table";
import React from "react";
import classes from "./TanstackTableBody.module.css";

const TanstackTableBody = ({ table, loading, error }): React.JSX.Element => {
    return (
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
                        <Box
                            className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                            key={row.id}
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
                        </Box>
                    ))}
                </ScrollArea>
            )}
        </Box>
    );
};

export default TanstackTableBody;
