import { ActionIcon, Avatar, Badge, Box, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { useState } from "react";
import classes from './UsersTable.module.css';
import BusinessCard from "../../atoms/display/BusinessCard/BusinessCard";
import { IconDotsVertical, IconEdit, IconFileImport, IconFilter, IconSearch, IconUserPlus } from "@tabler/icons-react";

const DATA = [
    {
        'details': {
            'avatar': '/icons/Tux.webp',
            'email': 'tux10@domain.com',
            'name': 'Tux',
            'surname': '10',
        },
        'roles': ['USER MANAGER', 'NETWORK MANAGER'],
        'lastActive': new Date('2020-02-22'),
    }, 
    {
        'details': {
            'avatar': '/icons/Geeko White.webp',
            'email': 'geeko@domain.com',
            'name': 'Geeko',
            'surname': '',
        },
        'roles': ['ADMINISTRATOR'],
        'lastActive': null
    }
]

const columns = [
    {
        accessorKey: 'details',
        header: 'Name',
        cell: (props) => {
            const {avatar, email, name, surname} = props.getValue() || {};

            return <BusinessCard 
                imageSrc={avatar} 
                comment={email}
                name={`${name} ${surname}`}
            />
        }
    },
    {
        accessorKey: 'roles',
        header: 'Roles',
        cell: (props) => (
            <Group>
                {(props.getValue() || []).map((role: string) => 
                    <Badge variant="light" color='blue' fw={500} size='lg'>{role}</Badge>
                )}
            </Group>
        )
    },
    {
        accessorKey: 'lastActive',
        header: 'Last active',
        cell: (props) => <Text>{props.getValue()?.toISOString().split('T')[0].replaceAll('-', '/')}</Text>
    },
    {
        accessorKey: 'options',
        header: '',
        size: 20,
        cell: () => <ActionIcon variant="transparent" color='dimmed'><IconDotsVertical/></ActionIcon>
    }
]

const UsersTable = () : React.JSX.Element => {
    const [data, setData] = useState(DATA);
    const table = useReactTable({
        data, 
        columns, 
        getCoreRowModel: getCoreRowModel()
    });

    return (
        <Stack>
            <Group justify="space-between">
                <Group>
                    <Title>All users </Title>
                    <Title c='dimmed'>{table.getRowCount()}</Title>
                </Group>
                <Group justify="flex-end">
                    <TextInput 
                        leftSection={<IconSearch size={16}/>}
                        placeholder="Search"
                        w={300}
                    />
                    <Button fw={400} w={150} variant="default" leftSection={<IconFilter size={16}/>}>Filters</Button>
                    <Button fw={400} w={150} variant="default" leftSection={<IconFileImport size={16}/>}>Import users</Button>
                    <Button w={150} variant="white" color="black" leftSection={<IconUserPlus size={16} stroke={3}/>}>Create user</Button>
                </Group>
            </Group>
            <Box className={classes.table}>
                {table.getHeaderGroups().map(headerGroup => 
                    <Box className={classes.tr} key={headerGroup.id}>
                        {headerGroup.headers.map(header =>
                            <Box className={classes.th} key={header.id}>
                                <Text>{header.column.columnDef.header as string}</Text>
                            </Box>
                        )}
                    </Box>
                )}
                {table.getRowModel().rows.map(row => 
                    <Box className={classes.tr} key={row.id}>
                        {row.getVisibleCells().map(cell =>
                            <Box className={classes.td} key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Box>
                        )}  
                    </Box>
                )}

            </Box>
        </Stack>
    );
}

export default UsersTable;