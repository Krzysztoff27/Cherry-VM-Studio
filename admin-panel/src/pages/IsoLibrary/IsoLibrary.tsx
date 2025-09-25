import { Paper, Stack } from "@mantine/core";
import classes from "./IsoLibrary.module.css";
import IsoTable from "../../components/organisms/tables/IsoTable/IsoTable";

const DUMMY_DATA = {
    "3e0a2af8-6cbe-4a0c-91f6-fc58a0e43811": {
        uuid: "3e0a2af8-6cbe-4a0c-91f6-fc58a0e43811",
        name: "Ubuntu 22.04 LTS",
        location: "https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso",
        size: "Remote",
        lastUsed: "2025-09-01T14:23:11",
        added: "2025-08-15T09:10:00",
        addedBy: {
            uuid: "b06c9dc3-9a2b-42fc-9b1d-78240f6c9f21",
            username: "sysadmin",
            email: "sysadmin@example.com",
            name: "Alice",
            surname: "Kowalski",
            creation_date: "2024-02-10T12:00:00Z",
            last_active: "2025-09-20T11:12:33Z",
            disabled: false,
        },
    },

    "1c4d2f6e-7b29-4cf8-a6d1-14a96225de23": {
        uuid: "1c4d2f6e-7b29-4cf8-a6d1-14a96225de23",
        name: "Windows 11 Pro",
        location: "Local",
        size: "5.2 GB",
        lastUsed: "2025-08-28T20:45:00",
        added: "2025-08-10T08:00:00",
        addedBy: {
            uuid: "94f5a7f0-0a14-4f60-92f2-88e3dd4a6d02",
            username: "devops",
            email: "devops@example.com",
            name: "Marek",
            surname: "Nowak",
            creation_date: "2023-07-19T14:45:00Z",
            last_active: "2025-09-24T09:01:12Z",
            disabled: false,
        },
    },

    "e53bc5a7-9b47-4e8a-a4e2-0c9f7f482331": {
        uuid: "e53bc5a7-9b47-4e8a-a4e2-0c9f7f482331",
        name: "Debian 12 Netinstall",
        location: "\\\\fileserver01.domain.local\\isos\\debian-12.1.0-amd64-netinst.iso",
        size: "Remote",
        lastUsed: "2025-09-20T16:10:21",
        added: "2025-07-02T13:30:00",
        addedBy: {
            uuid: "c621f4de-571d-48c1-bd2a-52b6f0c4f7fa",
            username: "jdoe",
            email: "jdoe@domain.local",
            name: "John",
            surname: "Doe",
            creation_date: "2022-05-12T09:15:00Z",
            last_active: "2025-09-23T15:05:55Z",
            disabled: false,
        },
    },

    "0d3f97a2-8572-41de-9456-1134f2cc9c0a": {
        uuid: "0d3f97a2-8572-41de-9456-1134f2cc9c0a",
        name: "Fedora 40 Workstation",
        location: "http://192.168.1.50/isos/fedora-40.iso",
        size: "Remote",
        lastUsed: "2025-09-10T11:33:47",
        added: "2025-06-25T17:00:00",
        addedBy: {
            uuid: "e08b1cfa-284a-4203-b145-9a763c07a111",
            username: "labuser",
            email: "labuser@internal.lan",
            name: "Elena",
            surname: "Wiśniewska",
            creation_date: "2023-01-09T07:30:00Z",
            last_active: "2025-09-24T12:20:45Z",
            disabled: false,
        },
    },

    "be7c4a5a-913f-4d3f-bf8f-6f4a422de876": {
        uuid: "be7c4a5a-913f-4d3f-bf8f-6f4a422de876",
        name: "Kali Linux 2025.2",
        location: "Local",
        size: "3.8 GB",
        lastUsed: "2025-09-22T19:41:00",
        added: "2025-09-01T11:25:00",
        addedBy: {
            uuid: "d490c91d-b320-4a56-8c29-88af41b82b39",
            username: "pentester",
            email: "pentester@example.org",
            name: "Tomasz",
            surname: "Lewandowski",
            creation_date: "2023-11-05T10:10:00Z",
            last_active: "2025-09-24T18:00:00Z",
            disabled: false,
        },
    },
};

const IsoLibrary = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <IsoTable
                    data={DUMMY_DATA}
                    loading={false}
                    error={null}
                />
            </Paper>
        </Stack>
    );
};

export default IsoLibrary;
