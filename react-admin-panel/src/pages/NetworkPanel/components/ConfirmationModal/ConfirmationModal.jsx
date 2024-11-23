import { Button, Modal, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function ConfirmationModal({modalProps, opened, message, title, cancelButtonProps, confirmButtonProps, onCancel, onConfirm}) {
    const { t } = useTranslation();
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
                    {message ?? t('confirm.unsaved.description', {ns: 'modals'})}
                </Text>
                <SimpleGrid cols={2} grow='true'>
                    <Button onClick={onCancel} variant='light' color='gray' radius='sm' data-autofocus {...cancelButtonProps}>Cancel</Button>
                    <Button onClick={onConfirm} variant='light' color="gray" radius='sm' {...confirmButtonProps}>Confirm</Button>
                </SimpleGrid>
            </Stack>
        </Modal>
    )
}
