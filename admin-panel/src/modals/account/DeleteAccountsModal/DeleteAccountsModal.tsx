import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { ErrorCallbackFunction } from "../../../types/hooks.types";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { ERRORS } from "../../../config/errors.config";

const DeleteAccountsModal = ({ opened, onClose, onSubmit = () => undefined, uuids }): React.JSX.Element => {
    const { deleteRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", "confirm.account-removal");
    const { sendErrorNotification } = useMantineNotifications();
    const { parseAndHandleError } = useErrorHandler();

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status == 400) {
            if (/permission unassigned/.test(json?.detail)) {
                sendErrorNotification(ERRORS.HTTP_400_CANNOT_REMOVE_USER);
                return;
            }
        }
        parseAndHandleError(response, json);
    };

    const onConfirm = () => {
        uuids.forEach((uuid) => deleteRequest(`user/delete/${uuid}`, undefined, onPostError));
        onClose();
        onSubmit();
    };

    return (
        <ConfirmationModal
            opened={opened}
            onClose={onClose}
            onConfirm={onConfirm}
            title={tns("title")}
            message={tns("description", { count: uuids.length })}
            confirmButtonProps={{ color: "cherry.6" }}
        />
    );
};

export default DeleteAccountsModal;
