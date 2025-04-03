import { Avatar, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import useFetch from "../../../hooks/useFetch";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { IconUsersGroup } from "@tabler/icons-react";
import MembersTable from "../../../components/organisms/MembersTable/MembersTable";
import classes from "./GroupModal.module.css";

const Placeholder = () => (
    <Stack className={classes.container}>
        <Group className={classes.header}>
            <Skeleton
                height="56"
                circle
            />
            <Stack flex="1">
                <Skeleton
                    w="40%"
                    height={16}
                    radius="xl"
                />
                <Skeleton
                    w="30%"
                    height={8}
                    radius="xl"
                />
            </Stack>
        </Group>
        <Group w="100%">
            <Skeleton
                height={8}
                radius="xl"
                w="100%"
            />
            <Skeleton
                height={8}
                radius="xl"
                w="100%"
            />
        </Group>
        <Stack
            w="90%"
            mt="lg"
        >
            {...Array(5).fill(
                <Group w="100%">
                    <Skeleton
                        height="40"
                        circle
                    />
                    <Stack
                        flex="1"
                        align="stretch"
                    >
                        <Skeleton
                            height={8}
                            radius="xl"
                        />
                        <Skeleton
                            height={6}
                            radius="xl"
                        />
                    </Stack>
                    <Skeleton
                        height="30"
                        w="10%"
                    ></Skeleton>
                </Group>
            )}
        </Stack>
    </Stack>
);

const GroupModal = ({ opened, onClose, uuid, onSubmit = () => undefined }): React.JSX.Element => {
    const { data: group, loading: groupLoading } = useFetch(`/group/${uuid}`);
    const { data: users, loading: usersLoading, refresh: refreshUsers } = useFetch(`/users?group=${uuid}`);
    const { parseAndHandleError } = useErrorHandler();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
        >
            <Stack
                align="center"
                h="560"
                p="md"
                pt="0"
            >
                <Group
                    w="100%"
                    mb="sm"
                >
                    <Avatar
                        color="cherry"
                        size="lg"
                    >
                        <IconUsersGroup size={32} />
                    </Avatar>
                    <Stack gap="0">
                        <Title order={2}>{group.name}</Title>
                        <Text c="dimmed">{group.users.length} clients</Text>
                    </Stack>
                </Group>
                <MembersTable
                    usersData={users}
                    refresh={refreshUsers}
                />
            </Stack>
        </Modal>
    );
};

export default GroupModal;
