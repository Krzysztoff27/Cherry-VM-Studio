import React from "react";
import { IconDotsVertical, IconEdit, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { ActionIcon, Button, Menu, Stack } from "@mantine/core";
import ModalButton from "../interactive/ModalButton/ModalButton";
import AccountDisplayModal from "../../molecules/modals/AccountDisplayModal/AccountDisplayModal";

const AccountOptionsCell = (): React.JSX.Element => {
    return (
        <Menu shadow="xl" width={160} position="left" withArrow>
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
                    <ModalButton 
                        ModalComponent={AccountDisplayModal}
                        variant="default"
                        bd='none' 
                        fw={400} 
                        rightSection={<IconUserCircle size={20}/>}
                        fullWidth
                        justify="right"
                    >
                        View profile
                    </ModalButton>
                    <Button 
                        variant="default"
                        bd='none'
                        fw={400} 
                        rightSection={<IconEdit size={20}/>}
                        fullWidth
                        justify="right"
                    >
                        Edit account
                    </Button>
                    <Button 
                        variant="default"
                        bd='none'
                        c='cherry.5'
                        fw={400} 
                        rightSection={<IconTrash size={20}/>}
                        fullWidth
                        justify="right"
                    >
                        Delete
                    </Button>
                </Button.Group>
            </Menu.Dropdown>
        </Menu>
    );
}

export default AccountOptionsCell;

{/* <ModalButton 
            ModalComponent={AccountDisplayModal}
            ButtonComponent={ActionIcon}
            variant='transparent'
            color='dimmed'
            size='sm'
        >
            <IconDotsVertical/>
        </ModalButton> */}