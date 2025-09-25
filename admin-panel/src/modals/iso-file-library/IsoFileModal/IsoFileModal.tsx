import { Box, Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import classes from "./IsoFileModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import AccountHeading from "../../../components/atoms/display/AccountHeading/AccountHeading";
import { IconDisc } from "@tabler/icons-react";
import BusinessCard from "../../../components/atoms/display/BusinessCard/BusinessCard";
import { getFullUserName } from "../../../utils/users";
import { User } from "../../../types/api.types";
import ModifiableText from "../../../components/atoms/interactive/ModifiableText/ModifiableText";

const IsoFileModal = ({ opened, onClose, uuid, refreshTable }): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "iso");

    const file = {
        uuid: "3e0a2af8-6cbe-4a0c-91f6-fc58a0e43811",
        name: "Ubuntu 22.04 LTS",
        location: "https://releases.ubuntu.com/22.04/ubuntu-22.04-live-server-amd64.iso",
        size: "1.7GB",
        lastUsed: "2025-09-01T14:23:11",
        addedOn: "2025-08-15T09:10:00",
        lastModifiedOn: "2025-08-15T09:10:00",
        addedBy: {
            uuid: "b06c9dc3-9a2b-42fc-9b1d-78240f6c9f21",
            username: "sysadmin",
            email: "sysadmin@example.com",
            name: "Alice",
            surname: "Kowalski",
            creation_date: "2024-02-10T12:00:00Z",
            last_active: "2025-09-20T11:12:33Z",
            disabled: false,
        },
        lastModifiedBy: {
            uuid: "b06c9dc3-9a2b-42fc-9b1d-78240f6c9f21",
            username: "sysadmin",
            email: "sysadmin@example.com",
            name: "Alice",
            surname: "Kowalski",
            creation_date: "2024-02-10T12:00:00Z",
            last_active: "2025-09-20T11:12:33Z",
            disabled: false,
        },
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            styles={{ body: { padding: 0 } }}
            withCloseButton={false}
        >
            <Stack pos="relative">
                <Box className={classes.topBox} />
                <Stack className={classes.stack}>
                    <Group className={classes.header}>
                        <IconDisc
                            size={96}
                            className={classes.icon}
                        />
                        <Stack className={classes.headerText}>
                            <Title
                                order={2}
                                className={classes.title}
                            >
                                {file.name}
                            </Title>
                            <Text className={classes.username}>{file.location.split("/").pop()} </Text>
                        </Stack>
                    </Group>

                    <Stack className={classes.details}>
                        <Text className={classes.detailLabel}>
                            {tns("location")}:
                            <br />
                            <ModifiableText
                                value={file.location}
                                viewProps={{ style: { color: "var(--mantine-color-dimmed)" } }} // when i use the class it breaks smh
                                editButtonClassName={classes.editTextButton}
                            />
                        </Text>
                        <Text className={classes.detailLabel}>
                            {tns("size")}:
                            <Text
                                span
                                className={classes.detailValue}
                            >
                                {` ${file.size}`}
                            </Text>
                        </Text>
                        <Text className={classes.detailLabel}>
                            {tns("last-used")}:
                            <Text
                                span
                                className={classes.detailValue}
                            >
                                {` ${file.lastUsed.replace("T", " ")}`}
                            </Text>
                        </Text>

                        <Group
                            mt="lg"
                            w="100%"
                            gap="xl"
                        >
                            <Stack gap="sm">
                                <Text className={classes.detailLabel}>
                                    {tns("added-on")}:
                                    <br />
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        {` ${file.addedOn.replace("T", " ")}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("added-by")}:</Text>
                                <BusinessCard
                                    name={getFullUserName(file.addedBy as User)}
                                    comment={`@${file.addedBy.username}`}
                                />
                            </Stack>
                            <Stack gap="sm">
                                <Text className={classes.detailLabel}>
                                    {tns("last-modified-on")}:
                                    <br />
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        {` ${file.lastModifiedOn.replace("T", " ")}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("last-modified-by")}:</Text>
                                <BusinessCard
                                    name={getFullUserName(file.lastModifiedBy as User)}
                                    comment={`@${file.lastModifiedBy.username}`}
                                />
                            </Stack>
                        </Group>
                    </Stack>

                    <Group className={classes.buttonGroup}>
                        <Button
                            className={classes.closeButton}
                            onClick={onClose}
                        >
                            {t("close")}
                        </Button>
                    </Group>
                </Stack>
            </Stack>
        </Modal>
    );
};

export default IsoFileModal;
