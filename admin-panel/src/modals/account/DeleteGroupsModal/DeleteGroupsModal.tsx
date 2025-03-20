import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

const DeleteGroupsModal = ({ opened, onClose, onSubmit = () => undefined, uuids }): React.JSX.Element => {
    const { deleteRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", "confirm.group-removal");

    const onConfirm = () => {
        uuids.forEach((uuid: string) => deleteRequest(`group/delete/${uuid}`));
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

export default DeleteGroupsModal;
