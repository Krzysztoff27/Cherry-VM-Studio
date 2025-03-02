import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { ActionIcon, Checkbox, Paper, Stack } from "@mantine/core";
import classes from './Clients.module.css';
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BuisnessCardCell from "../../../components/atoms/table/BuisnessCardCell";
import { IconDotsVertical } from "@tabler/icons-react";

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
        accessorKey: 'groups',
        header: 'Groups',
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
        cell: () => <ActionIcon variant="transparent" color='dimmed'><IconDotsVertical/></ActionIcon>
    }
]

const data = [
    {
        details: {
            'name': 'Tux',
            'surname': '10',
            'email': 'tux.10@domain.com'
        },
        groups: ['ACCOUNT MANAGER'],
        lastActive: new Date('2025-02-25'),
    }
]

const Admins = () : React.JSX.Element => {
    return (
        <Stack w='100%'>
            <Paper className={classes.tablePaper}>
                <AccountTable columns={columns} accountData={data} accountType='Client'/>
            </Paper>

        </Stack>
    );
}

export default Admins;