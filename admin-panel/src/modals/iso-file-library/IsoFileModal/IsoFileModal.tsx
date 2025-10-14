import { Box, Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import classes from "./IsoFileModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconDisc } from "@tabler/icons-react";
import BusinessCard from "../../../components/atoms/display/BusinessCard/BusinessCard";
import { getFullUserName } from "../../../utils/users";
import { IsoRecord, User } from "../../../types/api.types";
import ModifiableText from "../../../components/atoms/interactive/ModifiableText/ModifiableText";
import { formatBytesToRelevantUnit } from "../../../utils/files";
import { isNull } from "lodash";
import useFetch from "../../../hooks/useFetch";

const IsoFileModal = ({ opened, onClose, uuid, refreshTable }): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "iso");
    const { data, error, loading } = useFetch(`/iso/${uuid}`);

    const file = data as IsoRecord;

    if (loading || error) return;

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
                            <Text className={classes.username}>{file.file_name.split("/").pop()} </Text>
                        </Stack>
                    </Group>

                    <Stack className={classes.details}>
                        <Text className={classes.detailLabel}>
                            {tns("location")}:
                            <br />
                            <ModifiableText
                                onSave={() => {}}
                                canEdit={file.remote === true} // important so that undefined doesnt ruin this
                                value={file.file_location || "Local"}
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
                                {` ${formatBytesToRelevantUnit(file.file_size_bytes)}`}
                            </Text>
                        </Text>
                        <Text className={classes.detailLabel}>
                            {tns("last-used")}:
                            <Text
                                span
                                className={classes.detailValue}
                            >
                                {` ${file.last_used?.replace("T", " ")}`}
                            </Text>
                        </Text>

                        <Group
                            mt="lg"
                            w="100%"
                            gap="xl"
                            align="top"
                        >
                            <Stack gap="sm">
                                <Text className={classes.detailLabel}>
                                    {tns("added-on")}:
                                    <br />
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        {` ${file.imported_at.replace("T", " ")}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("added-by")}:</Text>
                                <BusinessCard
                                    name={getFullUserName(file.imported_by)}
                                    comment={`@${file.imported_by.username}`}
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
                                        {` ${file.last_modified_at?.replace("T", " ") ?? "-"}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("last-modified-by")}:</Text>
                                {file.last_modified_by ? (
                                    <BusinessCard
                                        name={getFullUserName(file.last_modified_by as User)}
                                        comment={`@${file.last_modified_by.username}`}
                                    />
                                ) : (
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        -
                                    </Text>
                                )}
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
