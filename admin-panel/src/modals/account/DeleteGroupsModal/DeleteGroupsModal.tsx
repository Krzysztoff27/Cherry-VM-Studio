import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";

const DeleteGroupsModal = ({ opened, onClose, onSubmit = () => undefined, uuids }): React.JSX.Element => {
    const { deleteRequest } = useApi();

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
            title="Group removal"
            message={
                uuids.length > 1
                    ? `All ${uuids.length} selected accounts will be removed. Are you sure you want to continue?`
                    : `One selected account will be removed. Are you sure you want to continue?`
            }
            confirmButtonProps={{ color: "cherry.6" }}
        />
    );
};

export default DeleteGroupsModal;
