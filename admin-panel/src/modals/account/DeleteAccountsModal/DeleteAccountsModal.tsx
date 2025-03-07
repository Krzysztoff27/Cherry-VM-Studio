import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";

const DeleteAccountsModal = ({opened, onClose, uuids}) : React.JSX.Element => {

    const onConfirm = () => {
        uuids.forEach(uuid => {
            console.log('Deleted ' + uuid);
        });
        onClose();
    }

    return (
        <ConfirmationModal 
            opened={opened}
            onClose={onClose}
            onConfirm={onConfirm}
            title='Account removal'
            message={
                uuids.length > 1 ? 
                `All ${uuids.length} selected accounts will be removed. Are you sure you want to continue?` :
                `One selected account will be removed. Are you sure you want to continue?`
            }
            confirmButtonProps={{color: 'cherry.6'}}
        />
    );
}

export default DeleteAccountsModal;