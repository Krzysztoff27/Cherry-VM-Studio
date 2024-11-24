import { notifications } from "@mantine/notifications"
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export const useMantineNotifications = () => {
    const { t } = useTranslation();
    const format = (keys: string[] | string, interpolatedValues = {}) => t(keys, {ns: 'notifications', ...interpolatedValues});
    
    // by using getSeconds we ensure that if multiple notifications of the same id 
    // are to be sent in a short amount of time (same second)
    // only one of them will be sent as they will have the same id
    const getUniqueId = (id: string) => `${id}${new Date().getSeconds()}` 
    
    const sendNotification = (id: string, {color = 'suse-green', loading = false, uniqueId = true} = {}, interpolatedValues: object | null) : Function => {
        const notificationId = uniqueId ? getUniqueId(id) : id;
        
        notifications.show({
            id: notificationId,
            color: color || 'suse-green',
            loading: loading || false,
            title: format(`${id}.title`, interpolatedValues),
            message: format(`${id}.message`, interpolatedValues),
        });

        return () => notifications.hide(notificationId);
    }

    /**
     * 
     * @param {Array|String} i18nextKey - key of the error in the translation files
     * @param {Object} interpolatedValues - values to be interpolated into i18next translation formatting
     * @returns function to hide the notification
     */
    const sendErrorNotification = (i18nextKeys: string[] | string = [], interpolatedValues = {}) => {
        i18nextKeys = [i18nextKeys].flat();
        const notificationId = getUniqueId(i18nextKeys[0]); 
        const keys: string[] = [...i18nextKeys, '600'];
        
        notifications.show({
            id: notificationId,
            withCloseButton: true,
            loading: false,
            autoClose: 5000,
            className: 'error-class',
            color: 'red',
            icon: <IconX/>,
            title: format(keys.map(key => `error.${key}.title`), interpolatedValues),
            message: format(keys.map(key => `error.${key}.message`), interpolatedValues)
        })

        return () => notifications.hide(notificationId);
    }

    return {
        sendNotification,
        sendErrorNotification
    }
}

export default useMantineNotifications;