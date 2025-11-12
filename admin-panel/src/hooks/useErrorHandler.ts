import useMantineNotifications from "./useMantineNotifications";
import { AxiosError } from "axios";
import { toString } from "lodash";
import { ErrorCode } from "react-i18next";
import { ERROR_VARIANTS_MAP, ExpandedErrorCode } from "../config/errors.config";

export interface ErrorHandlerReturn {
    handleError: (error: ErrorCode | ExpandedErrorCode) => Promise<void>;
    handleAxiosError: (error: AxiosError) => Promise<void>;
}

const useErrorHandler = (): ErrorHandlerReturn => {
    const { sendErrorNotification } = useMantineNotifications();

    const handleError = async (error: ErrorCode | ExpandedErrorCode) => {
        sendErrorNotification(error);
    };

    const handleAxiosError = async (error: AxiosError) => {
        const code = toString(error.response?.status || "600");
        const data = error.response?.data as Record<string, any>;
        const detail = data?.detail;
        const variant = ERROR_VARIANTS_MAP[code]?.[detail];

        sendErrorNotification([code, variant] as ErrorCode | ExpandedErrorCode);
    };

    return { handleError, handleAxiosError };
};

export default useErrorHandler;
