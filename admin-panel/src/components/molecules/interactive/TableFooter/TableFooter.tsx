import { ActionIcon, Box, Button, Flex, Group, Pagination, Stack, Tooltip } from "@mantine/core";
import React from "react";
import SizeSelect from "../../../atoms/interactive/SizeSelect/SizeSelect";
import classes from "./TableFooter.module.css";
import { TanstackTableLayout } from "../../display/TanstackTable/TanstackTable";

export interface TableFooterProps {
    layouts: TanstackTableLayout[];
    currentLayout: number;
    setCurrentLayout: React.Dispatch<React.SetStateAction<number>>;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    setPagination: (prev: any) => void;
    getPageCount: () => number | null | undefined;
}

const TableFooter = ({ layouts, currentLayout, setCurrentLayout, pagination, setPagination, getPageCount }: TableFooterProps): React.JSX.Element => {
    return (
        <Group className={classes.container}>
            <Flex
                className={classes.item}
                justify="start"
            >
                {layouts.length > 1 && (
                    <Button.Group>
                        {layouts.map((layout, i) => (
                            <Tooltip
                                key={i}
                                label={layout.name}
                                classNames={{ tooltip: classes.tooltip }}
                            >
                                <Button
                                    variant="default"
                                    className={classes.layoutButton}
                                    disabled={i === currentLayout}
                                    onClick={() => setCurrentLayout(i)}
                                >
                                    <layout.icon size={20} />
                                </Button>
                            </Tooltip>
                        ))}
                    </Button.Group>
                )}
            </Flex>
            <Flex
                className={classes.item}
                justify="center"
            >
                <Pagination
                    value={pagination.pageIndex + 1}
                    onChange={(val) => setPagination((prev) => ({ ...prev, pageIndex: val - 1 }))}
                    total={getPageCount() || 1}
                    siblings={2}
                    withEdges
                    classNames={{ control: classes.paginationControl }}
                />
            </Flex>
            <Flex
                className={classes.item}
                justify="end"
            >
                <SizeSelect
                    value={pagination.pageSize}
                    setValue={(val) => setPagination((prev) => ({ ...prev, pageSize: parseInt(val as string) }))}
                    sizes={[5, 10, 25, 50]}
                />
            </Flex>
        </Group>
    );
};

export default TableFooter;
