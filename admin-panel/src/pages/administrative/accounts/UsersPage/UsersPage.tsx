import { Stack, Paper, Portal } from "@mantine/core";
import { useState } from "react";
import AccountTable from "../../../../components/organisms/tables/AccountTable/AccountTable";
import useFetch from "../../../../hooks/useFetch";
import AccountModal from "../../../../modals/account/AccountModal/AccountModal";
import ChangePasswordModal from "../../../../modals/account/ChangePasswordModal/ChangePasswordModal";
import { AccountType } from "../../../../types/config.types";
import classes from "./UsersPage.module.css";

const UsersPage = ({ accountType }: { accountType: AccountType }): React.JSX.Element => {
    const { data, error, loading, refresh } = useFetch(`/users?account_type=${accountType}`);
    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [accountModalMode, setAccountModalMode] = useState<boolean>(false);
    const [modalsOpened, setModalsOpened] = useState({
        account: false,
        password: false,
    });

    const openPasswordModal = (uuid: string) => {
        setCurrentUuid(uuid);
        setModalsOpened((prev) => ({ ...prev, password: true }));
    };

    const closePasswordModal = () => setModalsOpened((prev) => ({ ...prev, password: false }));

    const openAccountModal = (uuid: string, mode: boolean) => {
        setAccountModalMode(mode);
        setCurrentUuid(uuid);
        setModalsOpened((prev) => ({ ...prev, account: true }));
    };

    const closeAccountModal = () => setModalsOpened((prev) => ({ ...prev, account: false }));

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <Portal>
                    <ChangePasswordModal
                        uuid={currentUuid}
                        opened={modalsOpened.password}
                        onClose={closePasswordModal}
                    />
                </Portal>
                {currentUuid && (
                    <AccountModal
                        mode={accountModalMode}
                        opened={modalsOpened.account}
                        refreshTable={refresh}
                        onClose={closeAccountModal}
                        openPasswordModal={openPasswordModal}
                        uuid={currentUuid}
                    />
                )}
                <AccountTable
                    accountType={accountType}
                    accounts={data}
                    loading={loading}
                    error={error}
                    refresh={refresh}
                    openAccountModal={openAccountModal}
                    openPasswordModal={openPasswordModal}
                />
            </Paper>
        </Stack>
    );
};

export default UsersPage;
