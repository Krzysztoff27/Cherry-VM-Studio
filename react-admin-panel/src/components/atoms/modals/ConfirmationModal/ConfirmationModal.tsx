import { Button, Modal, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ConfirmationModalProps } from '../../../../types/components.types.ts';
import useNamespaceTranslation from '../../../../hooks/useNamespaceTranslation.ts';

export default function ConfirmationModal({modalProps, opened, message, title, cancelButtonProps, confirmButtonProps, onCancel, onConfirm} : ConfirmationModalProps) {
    const { tns } = useNamespaceTranslation('modals');
    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            withCloseButton={false}
            {...modalProps}
        >
            <Stack>
                <Title order={4}>{title}</Title>
                <Text size='sm'>
                    {message ?? tns('confirm.unsaved.description')}
                </Text>
                <SimpleGrid cols={2}>
                    <Button onClick={onCancel} variant='light' color='gray' radius='sm' data-autofocus {...cancelButtonProps}>Cancel</Button>
                    <Button onClick={onConfirm} variant='light' color="gray" radius='sm' {...confirmButtonProps}>Confirm</Button>
                </SimpleGrid>
            </Stack>
        </Modal>
    )
}
