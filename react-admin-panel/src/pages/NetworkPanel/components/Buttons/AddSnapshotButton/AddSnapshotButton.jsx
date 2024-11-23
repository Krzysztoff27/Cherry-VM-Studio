import { Button, List, Loader, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useField } from '@mantine/form';
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCameraPlus } from "@tabler/icons-react";
import useErrorHandler from "../../../../../hooks/useErrorHandler";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useMantineNotifications from "../../../../../hooks/useMantineNotifications";

export default function AddSnapshotButton({ postSnapshot, initiateSnapshotDataUpdate }) {
    const [opened, { open, close }] = useDisclosure();

    const onClick = () => open();

    return (
        <>
            <AddSnapshotModal
                opened={opened}
                close={close}
                postSnapshot={postSnapshot}
                initiateSnapshotDataUpdate={initiateSnapshotDataUpdate}
            />
            <Button
                onClick={onClick}
                variant='default'
                size='sm'
                pl='xs'
                pr='9'
            >
                <IconCameraPlus size={20} />
            </Button>
        </>
    )
}

function AddSnapshotModal({ opened, close, postSnapshot, initiateSnapshotDataUpdate }) {
    const { t } = useTranslation();
    const { sendNotification } = useMantineNotifications();
    const { requestResponseError } = useErrorHandler();
    const [loading, setLoading] = useState(false);
    
    const field = useField({
        initialValue: '',
        validate: (value) => {
            if (!value || value?.length < 3) return t('custom.new-snapshot.error-too-short', {ns: 'modals'});
            if (value.length > 24) return t('custom.new-snapshot.error-too-long', {ns: 'modals'});
            if (!(/^[!-z]{3,32}$/.test(value))) return (
                <Stack gap='0'>
                    <Text fz='xs'>{t('custom.new-snapshot.error-bad-characters', {ns: 'modals'})}</Text>
                    <Text fz='xs'>{`! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ ] \ ^ _ \``}</Text>
                </Stack>
            )
            return;
        }
    })

    const onConfirm = async () => {
        setLoading(true)
        await field.validate().then(async (invalid) => {
            if (invalid) return;
            const name = field.getValue();

            const errorCallback = (res, body) => res?.status === 409 ? field.setError('Snapshot with this name already exists.') : requestResponseError(res, body);
            const response = await postSnapshot(name, errorCallback);
            if (!response) return;

            onCancel();
            initiateSnapshotDataUpdate();
            sendNotification('network-panel.snapshot-create', {}, {name: name});
        })
        setLoading(false);
    }

    const onCancel = () => {
        close();
        field.reset();
        setLoading(false);
    }

    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title={t('custom.new-snapshot.title', {ns: 'modals'})}
        >
            <Stack>
                <Stack gap='xs'>
                    <Text size='sm'>{t('custom.new-snapshot.description', {ns: 'modals'})}</Text>
                    <List size='sm'>
                        <List.Item>{t('custom.new-snapshot.bullet-point1', {ns: 'modals'})}</List.Item>
                        <List.Item>{t('custom.new-snapshot.bullet-point2', {ns: 'modals'})}</List.Item>
                        <List.Item>{t('custom.new-snapshot.bullet-point3', {ns: 'modals'})}</List.Item>
                    </List>
                </Stack>
                <TextInput
                    withAsterisk={true}
                    placeholder={t('custom.new-snapshot.placeholder', {ns: 'modals'})}
                    description={t('custom.new-snapshot.note', {ns: 'modals'})}
                    rightSection={loading ? <Loader size={18} /> : null}
                    {...field.getInputProps()}
                />
                <Button
                    type='submit'
                    variant='light'
                    radius='sm'
                    data-autofocus
                    onClick={onConfirm}
                >
                    {t('confirm')}
                </Button>
            </Stack>
        </Modal>
    )
}
