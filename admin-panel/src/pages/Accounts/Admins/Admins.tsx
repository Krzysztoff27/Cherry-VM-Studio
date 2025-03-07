import React, { useState } from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Checkbox, Paper, Stack } from "@mantine/core";
import classes from './Admins.module.css';
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BuisnessCardCell from "../../../components/atoms/table/BuisnessCardCell";
import AccountOptionsCell from "../../../components/atoms/table/AccountOptionsCell";
import { useDisclosure } from "@mantine/hooks";
import ProfileModal from "../../../modals/account/ProfileModal/ProfileModal";

const data = [
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/53.jpg",
            "email": "glenda.chambers@example.com",
            "name": "Glenda",
            "surname": "Chambers"
        },
        "roles": [
            "USER MANAGER"
        ],
        "lastActive": "2025-02-07T02:15:12.545Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/21.jpg",
            "email": "faraj.prabhakaran@example.com",
            "name": "Faraj",
            "surname": "Prabhakaran"
        },
        "roles": [
            "USER MANAGER"
        ],
        "lastActive": "2025-03-02T05:56:38.409Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/33.jpg",
            "email": "amber.hughes@example.com",
            "name": "Amber",
            "surname": "Hughes"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-27T12:31:56.385Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/76.jpg",
            "email": "barac.dacunha@example.com",
            "name": "Barac",
            "surname": "da Cunha"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-03-02T05:17:48.685Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/80.jpg",
            "email": "svitodara.ratushniy@example.com",
            "name": "Svitodara",
            "surname": "Ratushniy"
        },
        "roles": [
            "USER MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-11T02:40:56.298Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/68.jpg",
            "email": "faustia.ferreira@example.com",
            "name": "Fáustia",
            "surname": "Ferreira"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-15T20:24:12.117Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/26.jpg",
            "email": "louis.chow@example.com",
            "name": "Louis",
            "surname": "Chow"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-18T14:33:08.885Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/76.jpg",
            "email": "mexx.verwoerd@example.com",
            "name": "Mexx",
            "surname": "Verwoerd"
        },
        "roles": [
            "USER MANAGER"
        ],
        "lastActive": "2025-02-03T21:51:15.765Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/38.jpg",
            "email": "felix.martin@example.com",
            "name": "Felix",
            "surname": "Martin"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-10T06:56:58.566Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/77.jpg",
            "email": "judith.pearson@example.com",
            "name": "Judith",
            "surname": "Pearson"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-07T16:07:45.926Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/28.jpg",
            "email": "aapo.nikula@example.com",
            "name": "Aapo",
            "surname": "Nikula"
        },
        "roles": [
            "USER MANAGER"
        ],
        "lastActive": "2025-02-09T09:40:14.672Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/15.jpg",
            "email": "mhdys.mhmdkhn@example.com",
            "name": "مهدیس",
            "surname": "محمدخان"
        },
        "roles": [
            "USER MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-12T21:58:57.832Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/23.jpg",
            "email": "madeleine.patel@example.com",
            "name": "Madeleine",
            "surname": "Patel"
        },
        "roles": [
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-14T04:43:49.710Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/52.jpg",
            "email": "charlotte.white@example.com",
            "name": "Charlotte",
            "surname": "White"
        },
        "roles": [
            "MACHINE MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-03T02:04:20.147Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/6.jpg",
            "email": "kyrill.splinter@example.com",
            "name": "Kyrill",
            "surname": "Splinter"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-24T05:29:42.139Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/32.jpg",
            "email": "eric.gardner@example.com",
            "name": "Eric",
            "surname": "Gardner"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-16T00:10:33.565Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/39.jpg",
            "email": "jimi.wiitala@example.com",
            "name": "Jimi",
            "surname": "Wiitala"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-05T14:31:45.732Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/83.jpg",
            "email": "marija.polic@example.com",
            "name": "Marija",
            "surname": "Polić"
        },
        "roles": [
            "USER MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-22T22:10:51.658Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/87.jpg",
            "email": "ftmhzhr.prs@example.com",
            "name": "فاطمه زهرا",
            "surname": "پارسا"
        },
        "roles": [
            "USER MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-24T20:42:00.095Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/46.jpg",
            "email": "ivana.drljaca@example.com",
            "name": "Ivana",
            "surname": "Drljača"
        },
        "roles": [],
        "lastActive": "2025-02-25T10:06:12.373Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/90.jpg",
            "email": "walter.webb@example.com",
            "name": "Walter",
            "surname": "Webb"
        },
        "roles": [
            "USER MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-02T10:37:20.447Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/14.jpg",
            "email": "ferdinand.hackenberg@example.com",
            "name": "Ferdinand",
            "surname": "Hackenberg"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-21T08:58:01.692Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/54.jpg",
            "email": "angela.pastor@example.com",
            "name": "Angela",
            "surname": "Pastor"
        },
        "roles": [
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-23T00:38:16.506Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/41.jpg",
            "email": "eren.onur@example.com",
            "name": "Eren",
            "surname": "Önür"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-27T16:16:09.219Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/56.jpg",
            "email": "josep.fernandez@example.com",
            "name": "Josep",
            "surname": "Fernández"
        },
        "roles": [
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-06T09:20:24.279Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/98.jpg",
            "email": "philip.jensen@example.com",
            "name": "Philip",
            "surname": "Jensen"
        },
        "roles": [
            "USER MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-03-04T08:00:05.429Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/55.jpg",
            "email": "pry.hsyny@example.com",
            "name": "پریا",
            "surname": "حسینی"
        },
        "roles": [
            "MACHINE MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-06T04:21:54.485Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/48.jpg",
            "email": "jasna.kojic@example.com",
            "name": "Jasna",
            "surname": "Kojić"
        },
        "roles": [
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-11T01:04:06.804Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/9.jpg",
            "email": "norma.ramirez@example.com",
            "name": "Norma",
            "surname": "Ramirez"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-09T19:08:40.578Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/47.jpg",
            "email": "frida.poulsen@example.com",
            "name": "Frida",
            "surname": "Poulsen"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-21T01:03:29.052Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/91.jpg",
            "email": "alida.bjorndal@example.com",
            "name": "Alida",
            "surname": "Bjørndal"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-03T02:34:25.189Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/84.jpg",
            "email": "rowie.kokke@example.com",
            "name": "Rowie",
            "surname": "Kokke"
        },
        "roles": [
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-24T02:30:05.465Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/20.jpg",
            "email": "asta.jensen@example.com",
            "name": "Asta",
            "surname": "Jensen"
        },
        "roles": [
            "USER MANAGER"
        ],
        "lastActive": "2025-02-21T14:29:14.430Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/8.jpg",
            "email": "bently.knight@example.com",
            "name": "Bently",
            "surname": "Knight"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-02T14:18:13.752Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/42.jpg",
            "email": "murat.vidal@example.com",
            "name": "Murat",
            "surname": "Vidal"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-15T00:49:27.863Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
            "email": "leonardo.tufte@example.com",
            "name": "Leonardo",
            "surname": "Tufte"
        },
        "roles": [
            "MACHINE MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-16T19:46:52.797Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/72.jpg",
            "email": "ariena.vandegriend@example.com",
            "name": "Ariena",
            "surname": "Van de Griend"
        },
        "roles": [
            "USER MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-10T10:48:39.497Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/76.jpg",
            "email": "lucinda.barbosa@example.com",
            "name": "Lucinda",
            "surname": "Barbosa"
        },
        "roles": [
            "MACHINE MANAGER",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-19T17:21:15.816Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/54.jpg",
            "email": "raissa.wouters@example.com",
            "name": "Raissa",
            "surname": "Wouters"
        },
        "roles": [],
        "lastActive": "2025-03-01T05:03:50.487Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/91.jpg",
            "email": "mats.angvik@example.com",
            "name": "Mats",
            "surname": "Angvik"
        },
        "roles": [
            "USER MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-11T03:58:45.198Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/45.jpg",
            "email": "peyton.riley@example.com",
            "name": "Peyton",
            "surname": "Riley"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-03-02T20:18:09.071Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/61.jpg",
            "email": "cecilie.rasmussen@example.com",
            "name": "Cecilie",
            "surname": "Rasmussen"
        },
        "roles": [],
        "lastActive": "2025-02-22T05:48:45.537Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/87.jpg",
            "email": "lilly.joly@example.com",
            "name": "Lilly",
            "surname": "Joly"
        },
        "roles": [
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-27T01:09:44.452Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/30.jpg",
            "email": "jack.stone@example.com",
            "name": "Jack",
            "surname": "Stone"
        },
        "roles": [],
        "lastActive": "2025-02-28T23:35:33.907Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/15.jpg",
            "email": "zaqueu.goncalves@example.com",
            "name": "Zaqueu",
            "surname": "Gonçalves"
        },
        "roles": [
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR",
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-12T03:26:10.931Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/84.jpg",
            "email": "kurt.simon@example.com",
            "name": "Kurt",
            "surname": "Simon"
        },
        "roles": [
            "VNETWORK ADMINISTRATOR"
        ],
        "lastActive": "2025-02-12T08:24:28.437Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/69.jpg",
            "email": "shobha.vernekar@example.com",
            "name": "Shobha",
            "surname": "Vernekar"
        },
        "roles": [
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-28T16:31:24.935Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/men/69.jpg",
            "email": "david.nikitenko@example.com",
            "name": "David",
            "surname": "Nikitenko"
        },
        "roles": [
            "USER MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-09T23:19:51.100Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/51.jpg",
            "email": "lissy.alexander@example.com",
            "name": "Lissy",
            "surname": "Alexander"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER",
            "ACCOUNT ADMINISTRATOR"
        ],
        "lastActive": "2025-02-23T16:58:23.221Z"
    },
    {
        "details": {
            "avatar": "https://randomuser.me/api/portraits/women/7.jpg",
            "email": "louise.laurent@example.com",
            "name": "Louise",
            "surname": "Laurent"
        },
        "roles": [
            "USER MANAGER",
            "MACHINE MANAGER"
        ],
        "lastActive": "2025-02-04T02:04:22.404Z"
    }
];

const Admins = (): React.JSX.Element => {
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

    return (
        <Stack w='100%'>
            <Paper className={classes.tablePaper}>
                <AccountTable columns={columns} accountData={data} accountType='Administrative' />
            </Paper>

        </Stack>
    );
}

export default Admins;