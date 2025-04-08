import { useDisclosure } from "@mantine/hooks";
import GroupsTable from "../../../components/organisms/GroupsTable/GroupsTable";
import useFetch from "../../../hooks/useFetch";
import GroupModal from "../../../modals/account/GroupModal/GroupModal";
import classes from "./Groups.module.css";
import { Paper, Portal, Stack } from "@mantine/core";
import { useState } from "react";

const Groups = (): React.JSX.Element => {
    const { data: groupData, error, loading, refresh } = useFetch(`/groups`);

    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [opened, { open, close }] = useDisclosure();

    const openGroupModal = (uuid: string) => {
        setCurrentUuid(uuid), open();
    };

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <GroupModal
                    opened={opened}
                    onClose={close}
                    uuid={currentUuid}
                    refreshTable={refresh}
                />
                <GroupsTable
                    groupData={groupData}
                    error={error}
                    loading={loading}
                    refresh={refresh}
                    openGroupModal={openGroupModal}
                />
            </Paper>
        </Stack>
    );
};

export default Groups;
