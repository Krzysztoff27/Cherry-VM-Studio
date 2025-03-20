import { IconDotsVertical, IconEdit, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { ActionIcon, Button, Menu, Portal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AccountModal from "../../../modals/account/AccountModal/AccountModal";
import classes from "./AccountOptionsCell.module.css";
import DeleteAccountsModal from "../../../modals/account/DeleteAccountsModal/DeleteAccountsModal";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useState } from "react";

const AccountOptionsCell = ({ row, refreshData }): React.JSX.Element => {
    const uuid = row.id;
    const { tns } = useNamespaceTranslation("pages");
    const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false);
    const [accountMode, setAccountMode] = useState(false);
    const [accountOpened, { open: openAccount, close: closeAccount }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

    // we're not using ModalButton here since the modal would get unmounted along with the disapperaing menu

    return (
        <>
            <Portal>
                <AccountModal
                    opened={accountOpened}
                    onClose={closeAccount}
                    uuid={uuid}
                    onSubmit={refreshData}
                    mode={accountMode}
                />
                <DeleteAccountsModal
                    opened={deleteModalOpened}
                    onClose={closeDeleteModal}
                    uuids={[uuid]}
                    onSubmit={refreshData}
                />
            </Portal>
            <Menu
                opened={menuOpened}
                onChange={toggleMenu}
                shadow="xl"
                position="left"
                width={160}
            >
                <Menu.Target>
                    <ActionIcon
                        variant="transparent"
                        color="dimmed"
                        size="sm"
                    >
                        <IconDotsVertical />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown
                    p={0}
                    bd={"2px solid var(--mantine-color-dark-5)"}
                >
                    <Button.Group orientation="vertical">
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconUserCircle size={20} />}
                            onClick={() => {
                                setAccountMode(false);
                                openAccount();
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.view-profile")}
                        </Button>
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconEdit size={20} />}
                            onClick={() => {
                                setAccountMode(true);
                                openAccount();
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.edit-account")}
                        </Button>
                        <Button
                            className={`${classes.button} ${classes.delete}`}
                            variant="default"
                            justify="right"
                            rightSection={<IconTrash size={20} />}
                            onClick={() => {
                                openDeleteModal();
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.delete")}
                        </Button>
                    </Button.Group>
                </Menu.Dropdown>
            </Menu>
        </>
    );
};

export default AccountOptionsCell;
