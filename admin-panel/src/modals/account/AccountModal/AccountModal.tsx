import useFetch from "../../../hooks/useFetch";
import { Modal } from "@mantine/core";
import AccountDisplay from "../../../components/organisms/display/AccountDisplay/AccountDisplay";
import AccountEditForm from "../../../components/organisms/forms/AccountEditForm/AccountEditForm";
import AccountModalPlaceholder from "../../../components/organisms/display/AccountDisplay/AccountDisplayPlaceholder";
import { UserExtended } from "../../../types/api.types";

const AccountModal = ({ inEditMode, setInEditMode, opened, onClose, uuid, refreshTable, openPasswordModal }): React.JSX.Element => {
    const { data, error, loading, refresh: refreshUser } = useFetch<UserExtended>(`/user/${uuid}`, undefined, true);

    const toggle = () => setInEditMode((prev) => !prev);
    const refresh = () => {
        refreshTable();
        refreshUser();
    };

    const close = () => {
        setInEditMode(false);
        onClose();
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                size="lg"
                styles={{ body: { padding: 0 } }}
                withCloseButton={false}
            >
                {loading || error || !data ? (
                    <AccountModalPlaceholder onClose={onClose} />
                ) : inEditMode ? (
                    <AccountEditForm
                        user={data}
                        onCancel={toggle}
                        onSubmit={() => {
                            toggle();
                            refresh();
                        }}
                        openPasswordModal={openPasswordModal}
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
