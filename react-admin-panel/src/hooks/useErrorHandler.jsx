import useMantineNotifications from "./useMantineNotifications";
import { ERROR_DETAIL_MAPPING } from '../assets/errors';
import { safeObjectKeys } from '../utils/misc'

const useErrorHandler = () => {
    const { sendErrorNotification } = useMantineNotifications();

    /**
     * Parses and prepares a response error for UI display as a error notification.
     * @param {Response} response - request response recieved from the API
     * @param {Object} body - json parsed body of the response
     */
    const parseAndHandleError = async (response = new Response(), body = {}) => {
        let codes = [response?.status];
        if (safeObjectKeys(ERROR_DETAIL_MAPPING).includes(body.detail)) codes = [ERROR_DETAIL_MAPPING[body.detail], ...codes];
        sendErrorNotification(codes);
    }

    return { parseAndHandleError };
};

export default useErrorHandler;
