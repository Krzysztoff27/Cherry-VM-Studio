import { ActionIcon, Box, ScrollArea } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled } from "@tabler/icons-react";
import { flexRender } from "@tanstack/react-table";
import React from "react";
import classes from "TanstackTableBody.module.css";

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
