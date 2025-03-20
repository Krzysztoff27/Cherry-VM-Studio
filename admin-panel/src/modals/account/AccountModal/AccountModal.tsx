import { useEffect, useState } from "react";
import useFetch from "../../../hooks/useFetch";
import { Modal } from "@mantine/core";
import AccountDisplay from "../../../components/organisms/AccountDisplay/AccountDisplay";
import AccountEditForm from "../../../components/organisms/AccountEditForm/AccountEditForm";

const AccountModal = ({ mode, opened, onClose, uuid, onSubmit = () => undefined }): React.JSX.Element => {
    const [editMode, setEditMode] = useState<boolean>(mode);
    const { data, error, loading, refresh } = useFetch(`/user/${uuid}`);

    const toggle = () => setEditMode(prev => !prev);

    useEffect(() => {
        setEditMode(mode);
    }, [mode]);

    if (error) throw error;

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                size="lg"
                styles={{
                    body: {
                        padding: 0,
                    },
                }}
                withCloseButton={false}
            >
                {editMode ? (
                    <AccountEditForm
                        user={data}
                        onCancel={toggle}
                        onSubmit={() => {
                            toggle();
                            refresh();
                        }}
                    />
                ) : (
                    <AccountDisplay
                        user={data}
                        onClose={onClose}
                        onEdit={toggle}
                    />
                )}
            </Modal>
        </>
    );
};

export default AccountModal;
