import { IconDotsVertical, IconEdit, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { ActionIcon, Button, Menu, Portal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ProfileModal from "../../../modals/account/ProfileModal/ProfileModal";
import classes from "./AccountOptionsCell.module.css";

const AccountOptionsCell = ({row}): React.JSX.Element => {
    const [menuOpened, {close: closeMenu, toggle: toggleMenu}] = useDisclosure(false);
    const [profileOpened, {open: openProfile, close: closeProfile}] = useDisclosure(false);

    // we're not using ModalButton here since the modal would get unmounted along with the disapperaing button

    return (
        <>
            <Portal>
                <ProfileModal 
                    opened={profileOpened} 
                    onClose={closeProfile}
                    uuid={row.id}
                />
            </Portal>
            <Menu 
                opened={menuOpened} 
                onChange={toggleMenu}
                shadow="xl" 
                position="left" 
                width={160} 
                withArrow 
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
                <Menu.Dropdown p={0}>
                    <Button.Group orientation="vertical">
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconUserCircle size={20}/>}
                            onClick={() => {
                                openProfile();
                                closeMenu();
                            }}
                        >
                            View profile
                        </Button>
                        <Button 
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconEdit size={20}/>}
                            onClick={() => {
                                openProfile();
                                closeMenu();
                            }}
                        >
                            Edit account
                        </Button>
                        <Button 
                            className={`${classes.button} ${classes.delete}`} 
                            variant="default"
                            justify="right"
                            rightSection={<IconTrash size={20}/>}
                        >
                            Delete
                        </Button>
                    </Button.Group>
                </Menu.Dropdown>
            </Menu>
        </>
    );
}

export default AccountOptionsCell;