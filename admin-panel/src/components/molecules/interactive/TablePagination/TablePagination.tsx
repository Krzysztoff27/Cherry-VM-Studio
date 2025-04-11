import { Box, Group, Pagination, Stack } from "@mantine/core";
import React from "react";
import SizeSelect from "../../../atoms/interactive/SizeSelect/SizeSelect";
import classes from "./TablePagination.module.css";
import { TablePaginationProps } from "../../../../types/components.types";

const TablePagination = ({ pagination, setPagination, getPageCount }: TablePaginationProps): React.JSX.Element => {
    return (
        <Group className={classes.container}>
            <Box w="50" />
            <Pagination
                value={pagination.pageIndex + 1}
                onChange={val => setPagination(prev => ({ ...prev, pageIndex: val - 1 }))}
                total={getPageCount() || 1}
                siblings={2}
                withEdges
            />
            <SizeSelect
                value={pagination.pageSize}
                setValue={val => setPagination(prev => ({ ...prev, pageSize: parseInt(val as string) }))}
                sizes={[5, 10, 25, 50]}
            />
        </Group>
    );
};

export default TablePagination;
