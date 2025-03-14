import { Avatar, Group, Modal, Stack, Text, Title } from "@mantine/core";
import Loading from "../../../components/atoms/feedback/Loading/Loading";
import useFetch from "../../../hooks/useFetch";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { IconUsersGroup } from "@tabler/icons-react";
import MembersTable from "../../../components/organisms/MembersTable/MembersTable";

const GroupModal = ({ opened, onClose, uuid, onSubmit = () => undefined }): React.JSX.Element => {
    const { data: group, error: groupError, loading: groupLoading } = useFetch(`/group/${uuid}`);
    const { data: users, error: usersError, loading: usersLoading, refresh: refreshUsers } = useFetch(`/users?group=${uuid}`);
    const { parseAndHandleError } = useErrorHandler();

    if (groupLoading || usersLoading) return <Loading />;
    if (groupError || usersError) parseAndHandleError(groupError || usersError, (groupError || usersError).json());

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
                    mb="40"
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
