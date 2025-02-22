import { Table } from "@mantine/core";
import React from "react";
import { ContentTableProps } from "../../../../types/components.types";
import classes from './ContentTable.module.css';

const ContentTable = ({headers, rows}: ContentTableProps) : React.JSX.Element => {

    const createRow = (data: any[], Wrapper: any) => <Table.Tr className={classes.row}>{data.map(e => <Wrapper>{e}</Wrapper>)}</Table.Tr>

    const tableHead = createRow(headers, Table.Th);
    const tableBody = rows.map(row => createRow(row, Table.Td));

    return (
        <Table 
            stickyHeader
            withRowBorders={false}    
            striped
            verticalSpacing='sm'
            className={classes.table}
            >
            <Table.Thead>{tableHead}</Table.Thead>
            <Table.Tbody>{tableBody}</Table.Tbody>
        </Table>
    );
}

export default ContentTable;