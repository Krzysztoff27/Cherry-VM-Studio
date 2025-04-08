import { Avatar, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import useFetch from "../../../hooks/useFetch";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { IconUsersGroup } from "@tabler/icons-react";
import MembersTable from "../../../components/organisms/MembersTable/MembersTable";
import classes from "./GroupModal.module.css";
import AddMembersField from "../../../components/organisms/AddMembersField/AddMembersField";
import useApi from "../../../hooks/useApi";

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

const GroupModal = ({ opened, onClose, uuid, refreshTable = () => undefined }): React.JSX.Element => {
    const { data: group, loading, refresh } = useFetch(`/group/${uuid}`);
    const { putRequest } = useApi();

    const removeMember = async (member: string) => {
        await putRequest(`group/leave/${uuid}`, JSON.stringify([member]));
        refresh();
        refreshTable();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
        >
            {!group || loading ? (
                <Placeholder />
            ) : (
                <Stack
                    align="center"
                    h="560"
                    p="md"
                    pt="0"
                    gap="xl"
                >
                    <Group
                        w="100%"
                        mb="sm"
                    >
                        <Avatar
                            color="cherry"
                            size="xl"
                        >
                            <IconUsersGroup size={48} />
                        </Avatar>
                        <Stack gap="0">
                            <Title order={2}>{group.name}</Title>
                            <Text c="dimmed">{group.users.length} clients</Text>
                        </Stack>
                    </Group>

                    <Stack
                        w="100%"
                        flex="1"
                        gap="42"
                        mih="0"
                    >
                        <AddMembersField
                            alreadyAddedUsers={group.users}
                            groupUuid={uuid}
                            refresh={refresh}
                        />
                        <MembersTable
                            usersData={group.users}
                            refresh={refresh}
                            removeMember={removeMember}
                        />
                    </Stack>
                </Stack>
            )}
        </Modal>
    );
};

export default GroupModal;
