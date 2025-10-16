import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

const DeleteIsoModal = ({ opened, onClose, onSubmit = () => undefined, uuids }): React.JSX.Element => {
    const { deleteRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", "confirm.iso-removal");

    const onConfirm = async () => {
        await Promise.all(uuids.map((uuid: string) => deleteRequest(`iso/delete/${uuid}`)));
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

export default DeleteIsoModal;
