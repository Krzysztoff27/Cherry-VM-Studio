import { Avatar, Badge, Button, Group, List, Modal, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import React, { useEffect } from "react";
import RolesCell from "../../../components/atoms/table/RolesCell";
import ModalButton from "../../../components/atoms/interactive/ModalButton/ModalButton";
import ChangePasswordModal from "../ChangePasswordModal/ChangePasswordModal";

const EditMode = ({ onSubmit, onClose, toggle }) => (
    <>
        <Avatar
            name="Janusz Maurykowski"
            color="initials"
            size="xl"
        />
        <Stack
            align="center"
            gap="4"
            w="100%"
        >
            <Stack
                w="100%"
                pr="md"
                gap="xs"
            >
                <Group
                    w="100%"
                    gap="xs"
                >
                    <Text
                        w="100px"
                        pr="xs"
                        ta="right"
                    >
                        Email
                    </Text>
                    <TextInput
                        flex="1"
                        value="janusz.maurykowski@domain.domain2.com"
                        styles={{
                            input: {
                                // textAlign: 'center',
                                fontSize: "1rem",
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                        }}
                        autoFocus
                    />
                </Group>
                <Group
                    w="100%"
                    gap="xs"
                >
                    <Text
                        w="100px"
                        pr="xs"
                        ta="right"
                    >
                        Name
                    </Text>
                    <TextInput
                        flex="1"
                        value="Janusz"
                        styles={{
                            input: {
                                // textAlign: 'center',
                                fontSize: "1rem",
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                        }}
                    />
                </Group>
                <Group
                    w="100%"
                    gap="xs"
                >
                    <Text
                        w="100px"
                        pr="xs"
                        ta="right"
                    >
                        Surname
                    </Text>
                    <TextInput
                        flex="1"
                        value="Maurykowski"
                        styles={{
                            input: {
                                // textAlign: 'center',
                                fontSize: "1rem",
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                        }}
                    />
                </Group>
                <Group
                    w="100%"
                    gap="xs"
                >
                    <Text
                        w="100px"
                        pr="xs"
                        ta="right"
                    >
                        Password
                    </Text>
                    <PasswordInput
                        disabled
                        flex="1"
                        value="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                        styles={{
                            input: {
                                fontSize: "1rem",
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                            innerInput: {
                                padding: "16px",
                            },
                        }}
                    />
                    <ModalButton
                        ModalComponent={ChangePasswordModal}
                        buttonProps={{
                            variant: "default",
                            flex: "1",
                            border: "none",
                            leftSection: <IconEdit size={20} />,
                        }}
                    >
                        Change password
                    </ModalButton>
                </Group>
            </Stack>
        </Stack>
        <Group
            w="80%"
            bg="dark.8"
            p="sm"
            flex={1}
            align="start"
            style={{ borderRadius: "8px" }}
        >
            {["TEACHER", "GROUP CREATOR"].map((role, i) => (
                <Badge
                    key={i}
                    variant="light"
                    color="teal"
                    size="lg"
                    fw={500}
                >
                    {role}
                </Badge>
            ))}
        </Group>
        <Group
            w="100%"
            justify="center"
        >
            <Button
                w={100}
                variant="light"
                color="gray"
                onClick={toggle}
            >
                Cancel
            </Button>
            <Button
                w={100}
                variant="white"
                c="black"
                onClick={() => {
                    onSubmit();
                    toggle();
                }}
            >
                Save
            </Button>
        </Group>
    </>
);

const ViewMode = ({ onSubmit, onClose, toggle }) => (
    <>
        <Avatar
            name="Janusz Maurykowski"
            color="initials"
            size="xl"
        />
        <Stack
            align="center"
            gap="4"
            w="100%"
        >
            <Title
                order={5}
                c="dimmed"
                fw="500"
            >
                janusz.maurykowski@domain.domain2.com
            </Title>
            <Title order={3}>Janusz Maurykowski</Title>
            <ModalButton
                ModalComponent={ChangePasswordModal}
                buttonProps={{
                    variant: "default",
                    w: "50%",
                    m: "12",
                    bd: "none",
                    leftSection: <IconEdit size={20} />,
                }}
            >
                Change password
            </ModalButton>
        </Stack>
        <List
            size="sm"
            c="dark.1"
        >
            <List.Item>This user can VIEW, MANAGE all machines.</List.Item>
            <List.Item>This user can VIEW client accounts.</List.Item>
            <List.Item>This user can VIEW, MANAGE owned client groups.</List.Item>
            <List.Item>This user can CREATE new client groups.</List.Item>
        </List>

        <Group
            w="80%"
            bg="dark.8"
            p="sm"
            flex={1}
            align="start"
            style={{ borderRadius: "8px" }}
        >
            {["TEACHER", "GROUP CREATOR"].map((role, i) => (
                <Badge
                    key={i}
                    variant="light"
                    color="teal"
                    size="lg"
                    fw={500}
                >
                    {role}
                </Badge>
            ))}
        </Group>
        <Group
            w="100%"
            justify="center"
        >
            <Button
                w={100}
                variant="white"
                c="black"
                onClick={toggle}
            >
                Edit
            </Button>
            <Button
                w={100}
                variant="light"
                color="gray"
                onClick={onClose}
            >
                Close
            </Button>
        </Group>
    </>
);

const ProfileModal = ({ opened, onClose, uuid, onSubmit = () => undefined }): React.JSX.Element => {
    const [editMode, { toggle, close: closeEditMode }] = useDisclosure(false);

    useEffect(() => {
        closeEditMode();
    }, []);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
        >
            <Stack
                align="center"
                gap="sm"
                h="560"
            >
                {editMode ? (
                    <EditMode
                        onSubmit={onSubmit}
                        onClose={onClose}
                        toggle={toggle}
                    />
                ) : (
                    <ViewMode
                        onSubmit={onSubmit}
                        onClose={onClose}
                        toggle={toggle}
                    />
                )}
            </Stack>
        </Modal>
    );
};

export default ProfileModal;
