import { useState } from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import useFetch from "../../../hooks/useFetch";
import AccountModal from "../../../modals/account/AccountModal/AccountModal";
import classes from "./Admins.module.css";
import { Paper, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const Admins = (): React.JSX.Element => {
    const { data, error, loading, refresh } = useFetch(`/users?account_type=administrative`);

    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [modalMode, setModalMode] = useState<boolean>(false);
    const [opened, { open, close }] = useDisclosure();

    const openAccountModal = (uuid: string, mode: boolean) => {
        setModalMode(mode);
        setCurrentUuid(uuid);
        open();
    };

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountModal
                    mode={modalMode}
                    opened={opened}
                    refreshTable={refresh}
                    onClose={close}
                    uuid={currentUuid}
                />
                <AccountTable
                    accountType="administrative"
                    userData={data}
                    error={error}
                    loading={loading}
                    refresh={refresh}
                    openAccountModal={openAccountModal}
                />
            </Paper>
        </Stack>
    );
};

export default Admins;
