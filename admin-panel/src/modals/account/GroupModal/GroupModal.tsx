import { Avatar, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import useFetch from "../../../hooks/useFetch";
import { IconUsersGroup } from "@tabler/icons-react";
import MembersTable from "../../../components/organisms/tables/MembersTable/MembersTable";
import classes from "./GroupModal.module.css";
import AddMembersField from "../../../components/molecules/interactive/AddMembersField/AddMembersField";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useEffect, useState } from "react";
import { Group as GroupType, UserInDB } from "../../../types/api.types";
import ModifiableText from "../../../components/atoms/interactive/ModifiableText/ModifiableText";

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
    const { data: group, loading, refresh: refreshModal } = useFetch<GroupType>(uuid ? `/group/${uuid}` : undefined);
    const { tns, t } = useNamespaceTranslation("modals", "group");
    const { sendRequest } = useApi();

    const refresh = () => {
        refreshTable();
        refreshModal();
    };

    const removeMember = async (member: string) => {
        await sendRequest("PUT", `group/leave/${uuid}`, { data: [member] });
        refresh();
    };

    const addMembers = async (members: string[]) => {
        await sendRequest("PUT", `group/join/${uuid}`, { data: members });
        refresh();
    };

    const renameGroup = async (new_name: string) => {
        await sendRequest("PATCH", `group/rename/${uuid}`, { data: { name: new_name } });
        refresh();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
        >
            {!group && loading ? (
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
                        h="100"
                    >
                        <Avatar
                            color="cherry"
                            size="xl"
                        >
                            <IconUsersGroup size={48} />
                        </Avatar>
                        {group && (
                            <Stack gap="0">
                                <ModifiableText
                                    value={group?.name}
                                    className={classes.title}
                                    editContainerClassName={classes.titleEdit}
                                    onSave={renameGroup}
                                />
                                <Text c="dimmed">{tns("client-count", { count: group.users.length })}</Text>
                            </Stack>
                        )}
                    </Group>
                    <Stack
                        w="100%"
                        flex="1"
                        gap="42"
                        mih="0"
                    >
                        <AddMembersField
                            alreadyAddedUuids={(group?.users || []).map((user: UserInDB) => user.uuid)}
                            onSubmit={addMembers}
                        />
                        <MembersTable
                            usersData={group?.users || []}
                            removeMember={removeMember}
                        />
                    </Stack>
                </Stack>
            )}
        </Modal>
    );
};

export default GroupModal;
