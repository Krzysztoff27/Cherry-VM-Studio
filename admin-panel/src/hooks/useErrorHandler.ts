import useMantineNotifications from "./useMantineNotifications";
import { ERROR_DETAIL_MAPPING } from '../config/errors.config';
import { safeObjectKeys } from '../utils/misc'
import { ErrorResponseBody } from "../types/api.types";
import { AxiosError } from "axios";

const useErrorHandler = () => {
    const { sendErrorNotification } = useMantineNotifications();

    const parseAndHandleError = async (error: AxiosError) => {
        let codes = [error.response.status];
        
        if (safeObjectKeys(ERROR_DETAIL_MAPPING).includes(error.response?.data?.detail) codes = [ERROR_DETAIL_MAPPING[body.detail], ...codes];
        sendErrorNotification(codes);
    }

    return { parseAndHandleError };
};

export default useErrorHandler;
