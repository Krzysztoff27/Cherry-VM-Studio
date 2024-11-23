import { Button } from '@mantine/core'
import React from 'react'
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal'
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import useMantineNotifications from '../../../../../hooks/useMantineNotifications';

export default function RestoreButton({resetFlow = () => {}, isDirty}) {
    const { t } = useTranslation();
    const {sendNotification} = useMantineNotifications();
    const [opened, {open, close}] = useDisclosure();
    
    const onClick = () => open();
    const onCancel = () => close();
    const onConfirm = () => {
        close();
        resetFlow(false)
        .then(() => sendNotification('network-panel.flow-restore'));
    }
    
    return (
        <>
            <ConfirmationModal 
                opened={opened} 
                onCancel={onCancel}
                onConfirm={onConfirm}
                title={t('confirm.np-restore.title', {ns: 'modals'})}
                message={t('confirm.np-restore.description', {ns: 'modals'})}
                confirmButtonProps={{color: 'red.7'}}
            />
            <Button
                onClick={onClick}
                display={!isDirty ? 'none' : undefined}
                disabled={!isDirty}
                variant='default'
                w={100}
            >
                {t('discard')}
            </Button>
        </>
    )
}
