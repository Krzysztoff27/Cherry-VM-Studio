import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Checkbox, Paper, Stack } from "@mantine/core";
import classes from './Admins.module.css';
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BuisnessCardCell from "../../../components/atoms/table/BuisnessCardCell";
import AccountOptionsCell from "../../../components/atoms/table/AccountOptionsCell";

const columns = [
    {
        accessorKey: 'selection',
        enableSorting: false,
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={() => table.toggleAllRowsSelected()} 
                color='cherry'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              color='cherry'
            />
        ),
    },
    {
        accessorKey: 'details',
        header: 'Name',
        cell: BuisnessCardCell,
        sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
        filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
    },
    {
        accessorKey: 'roles',
        header: 'Roles',
        enableSorting: false,
        cell: RolesCell
    },
    {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: DateDifferenceCell,
    },
    {
        accessorKey: 'options',
        header: '',
        enableSorting: false,
        cell: AccountOptionsCell,
    }
]

const data = [
    {
        uuid: '123456789',
        details: {
            'name': 'Tux',
            'surname': '10',
            'email': 'tux.10@domain.com'
        },
        roles: ['ACCOUNT MANAGER'],
        lastActive: new Date('2025-02-25'),
    },
    {
        uuid: 'abc',
        details: {
            'name': 'Tux',
            'surname': '10',
            'email': 'tux.10@domain.com'
        },
        roles: ['ACCOUNT MANAGER'],
        lastActive: new Date('2025-02-25'),
    }
]

const Admins = () : React.JSX.Element => {
    return (
        <Stack w='100%'>
            <Paper className={classes.tablePaper}>
                <AccountTable columns={columns} accountData={data} accountType='Administrative'/>
            </Paper>

        </Stack>
    );
}

export default Admins;