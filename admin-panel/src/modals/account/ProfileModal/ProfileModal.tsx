import { Avatar, Badge, Button, Group, List, Modal, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import React, { useEffect } from "react";
import ModalButton from "../../../components/atoms/interactive/ModalButton/ModalButton";
import ChangePasswordModal from "../ChangePasswordModal/ChangePasswordModal";
import useFetch from "../../../hooks/useFetch";
import Loading from "../../../components/atoms/feedback/Loading/Loading";

const EditMode = ({ onSubmit, onClose, toggle, user }) => (
    <>
        <Avatar
            name={`${user.name} ${user.surname}`}
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
                        Name
                    </Text>
                    <TextInput
                        flex="1"
                        value={user.name}
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
                        value={user.surname}
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
                        Username
                    </Text>
                    <TextInput
                        flex="1"
                        value={user.username}
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
                        Email
                    </Text>
                    <TextInput
                        flex="1"
                        value={user.email}
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
                            flex: "1",
                            variant: "default",
                            bd: "none",
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
            {user.account_type == "administrative"
                ? user?.roles?.map((role, i) => (
                      <Badge
                          key={i}
                          variant="light"
                          color="teal"
                          size="lg"
                          fw={500}
                      >
                          {role}
                      </Badge>
                  ))
                : user?.groups?.map((group, i) => (
                      <Badge
                          key={i}
                          variant="light"
                          color="gray"
                          size="lg"
                          fw={500}
                      >
                          {group}
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

const AdminDetails = ({ user }) => (
    <Stack
        w="100%"
        align="center"
        flex="1"
    >
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
            {user.roles?.map((role, i) => (
                <Badge
                    key={i}
                    variant="light"
                    color="gray"
                    size="lg"
                    fw={500}
                >
                    {role}
                </Badge>
            ))}
        </Group>
    </Stack>
);

const ViewMode = ({ onSubmit, onClose, toggle, user }) => (
    <>
        <Avatar
            name={`${user.name} ${user.surname}`}
            color="initials"
            size="xl"
        />
        <Stack
            align="center"
            gap="8"
            w="100%"
        >
            <Title
                order={5}
                c="dimmed"
                fw="500"
            >
                @{user.username}
            </Title>
            <Title order={3}>{`${user.name} ${user.surname}`}</Title>
            <Badge
                variant="light"
                color={user.account_type == "administrative" ? "cherry" : "teal"}
                size="lg"
                fw={500}
            >
                {user.account_type === "administrative" ? "Administrator" : "Client user"}
            </Badge>
        </Stack>

        {user.account_type === "administrative" ? <AdminDetails user={user} /> : <Stack flex="1"></Stack>}

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
    const { data, error, loading } = useFetch(`/user/${uuid}`);

    useEffect(() => {
        closeEditMode();
    }, []);

    if (loading) return <Loading />;
    if (error) throw error;

    const Content = editMode ? EditMode : ViewMode;

    console.log(data);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
        >
            <Stack
                align="center"
                gap="md"
                h="560"
            >
                <Content
                    onSubmit={onSubmit}
                    onClose={onClose}
                    toggle={toggle}
                    user={data}
                />
            </Stack>
        </Modal>
    );
};

export default ProfileModal;
