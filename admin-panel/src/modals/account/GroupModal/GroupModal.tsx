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
import GroupModalPlaceholder from "./GroupModalPlaceholder";

const GroupModal = ({ opened, onClose, uuid, refreshTable = () => undefined }): React.JSX.Element => {
    const { data: group, loading, error, refresh: refreshModal } = useFetch<GroupType>(uuid ? `/group/${uuid}` : undefined);
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
                <GroupModalPlaceholder />
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
                            loading={loading}
                            error={error}
                        />
                    </Stack>
                </Stack>
            )}
        </Modal>
    );
};

export default GroupModal;
