import { List, Stack, Text } from "@mantine/core";
import { useState } from "react";
import useNamespaceTranslation from "../../hooks/useNamespaceTranslation";
import useMantineNotifications from "../../hooks/useMantineNotifications";
import useErrorHandler from "../../hooks/useErrorHandler";
import TextFieldModal from "../base/TextFieldModal/TextFieldModal";

const AddSnapshotModal = ({ opened, close, postSnapshot, initiateSnapshotDataUpdate }) => {
    const { tns } = useNamespaceTranslation('modals');
    const { sendNotification } = useMantineNotifications();
    const { parseAndHandleError } = useErrorHandler();
    const [error, setError] = useState<string>('');

    const validate = (value: string) => {
        if (!value || value?.length < 3) return tns('custom.new-snapshot.error-too-short');
        if (value.length > 24) return tns('custom.new-snapshot.error-too-long');
        if (!(/^[!-z]{3,32}$/.test(value))) return (
            <>
                <Text component="span" fz='xs'>
                    {tns('custom.new-snapshot.error-bad-characters')}
                </Text><br/>
                <Text component="span" fz='xs'>
                    {`! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ ] \ ^ _ \``}
                </Text>
            </>
        )
        return;
    }


    const onConfirm = async (name: string) => {
        const errorCallback = (res: Response, body: object) =>
            res?.status === 409 ? setError('Snapshot with this name already exists.') : parseAndHandleError(res, body);
        const response = await postSnapshot(name, errorCallback);
        if (!response) return;
        
        close();
        initiateSnapshotDataUpdate();
        sendNotification('network-panel.snapshot-create', {}, { name: name });
    }
    

    return (

        <TextFieldModal
            opened={opened}
            title={tns('custom.new-snapshot.title')}
            inputProps={{
                withAsterisk: true,
                placeholder: tns('custom.new-snapshot.placeholder'),
                description: tns('custom.new-snapshot.note')
            }}
            error={error}
            onValidate={validate}
            onCancel={close}
            onConfirm={onConfirm}
        >
            <Stack gap='xs'>
                <Text size='sm'>{tns('custom.new-snapshot.description')}</Text>
                <List size='sm'>
                    <List.Item>{tns('custom.new-snapshot.bullet-point1')}</List.Item>
                    <List.Item>{tns('custom.new-snapshot.bullet-point2')}</List.Item>
                    <List.Item>{tns('custom.new-snapshot.bullet-point3')}</List.Item>
                </List>
            </Stack>

        </TextFieldModal>
    )
}

export default AddSnapshotModal;