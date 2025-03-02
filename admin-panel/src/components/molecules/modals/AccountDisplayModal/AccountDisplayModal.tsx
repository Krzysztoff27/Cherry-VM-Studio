import { Avatar, Badge, Button, Group, List, Modal, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import React, { useEffect } from "react";
import RolesCell from "../../../atoms/table/RolesCell";

const AccountDisplayModal = ({ opened, onClose }): React.JSX.Element => {
    const [editMode, { toggle, close: closeEditMode }] = useDisclosure(false);

    // useEffect(() => {closeEditMode()}, [opened])

    const onSubmit = () => {

    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size='lg'
        >
            <Stack align="center" gap='sm' h='560'>
                <Avatar name='Janusz Maurykowski' color="initials" size='xl' />
                <Stack align='center' gap='4' w='100%'>
                    {
                        editMode ? (
                            <Stack w='100%' pr='md' gap='xs'>
                                <Group w='100%' gap='xs'>
                                    <Text w='100px' pr='xs' ta='right'>Email</Text>
                                    <TextInput
                                        flex='1'
                                        value='janusz.maurykowski@domain.domain2.com'
                                        styles={{
                                            input: {
                                                // textAlign: 'center',
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                color: 'var(--mantine-color-dimmed)',
                                                border: 'none',
                                            },
                                        }}
                                        autoFocus
                                    />
                                </Group>
                                <Group w='100%' gap='xs'>
                                    <Text w='100px' pr='xs' ta='right'>Name</Text>
                                    <TextInput
                                        flex='1'
                                        value='Janusz'
                                        styles={{
                                            input: {
                                                // textAlign: 'center',
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                color: 'var(--mantine-color-dimmed)',
                                                border: 'none',
                                            },
                                        }}
                                    />
                                </Group>
                                <Group w='100%' gap='xs'>
                                    <Text w='100px' pr='xs' ta='right'>Surname</Text>
                                    <TextInput
                                        flex='1'
                                        value='Maurykowski'
                                        styles={{
                                            input: {
                                                // textAlign: 'center',
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                color: 'var(--mantine-color-dimmed)',
                                                border: 'none',
                                            },
                                        }}
                                    />
                                </Group>
                                <Group w='100%' gap='xs'>
                                    <Text w='100px' pr='xs' ta='right'>Password</Text>
                                    <PasswordInput
                                        disabled
                                        flex='1'
                                        value='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                                        styles={{
                                            input: {                                                
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                color: 'var(--mantine-color-dimmed)',
                                                border: 'none',
                                            },
                                            innerInput: {
                                                padding: '16px'
                                            }
                                        }}
                                        
                                    />
                                    <Button variant="default" flex='1' leftSection={<IconEdit size={20} />} bd='none'>
                                    Change password
                                </Button>
                                </Group>

                            </Stack>
                        ) : (
                            <>
                                <Title order={5} c='dimmed' fw='500'>janusz.maurykowski@domain.domain2.com</Title>
                                <Title order={3}>Janusz Maurykowski</Title>
                                <Button variant="default" w='50%' m='12' leftSection={<IconEdit size={20} />} bd='none'>
                                    Change password
                                </Button>
                            </>
                        )
                    }
                </Stack>
                {
                    !editMode && (
                        <List size='sm' c='dark.1'>
                            <List.Item>This user can VIEW, MANAGE all machines.</List.Item>
                            <List.Item>This user can VIEW client accounts.</List.Item>
                            <List.Item>This user can VIEW, MANAGE owned client groups.</List.Item>
                            <List.Item>This user can CREATE new client groups.</List.Item>
                        </List>
                    )
                }
                <Group w='80%' bg='dark.8' p='sm' flex={1} align="start" style={{ borderRadius: '8px' }}>
                    {
                        ["TEACHER", "GROUP CREATOR"].map((role, i) => (
                            <Badge
                                key={i}
                                variant="light"
                                color='teal'
                                size='lg'
                                fw={500}
                            >
                                {role}
                            </Badge>
                        ))
                    }
                </Group>
                {
                    editMode ? (
                        <Group w='100%' justify="center">
                            <Button w={100} variant="light" color='cherry' onClick={toggle}>Cancel</Button>
                            <Button w={100} variant="light" color='suse-green' onClick={() => {
                                onSubmit();
                                toggle();
                            }}>Save</Button>
                        </Group>
                    ) : (
                        <Group w='100%' justify="center">
                            <Button w={100} variant="white" c='black' onClick={toggle}>Edit</Button>
                            <Button w={100} variant="light" color='gray' onClick={onClose}>Close</Button>
                        </Group>
                    )
                }

            </Stack>
        </Modal>
    );
}

export default AccountDisplayModal;