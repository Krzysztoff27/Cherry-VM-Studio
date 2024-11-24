import useMantineNotifications from "./useMantineNotifications";
import { ERROR_DETAIL_MAPPING } from '../assets/errors';
import { safeObjectKeys } from '../utils/misc'
import { ErrorResponseBody } from "../types/api.types";

const useErrorHandler = () => {
    const { sendErrorNotification } = useMantineNotifications();

    const parseAndHandleError = async (response: Response = new Response(), body: ErrorResponseBody = {}) => {
        let codes = [response?.status];
        if (safeObjectKeys(ERROR_DETAIL_MAPPING).includes(body.detail)) codes = [ERROR_DETAIL_MAPPING[body.detail], ...codes];
        sendErrorNotification(codes);
    }

    return { parseAndHandleError };
};

export default useErrorHandler;
