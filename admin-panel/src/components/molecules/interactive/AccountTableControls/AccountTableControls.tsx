import { Button, Group } from "@mantine/core";
import React from "react";
import TableSearch from "../TableSearch/TableSearch";
import ExpandingButton from "../../../atoms/interactive/ExpandingButton/ExpandingButton";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import DeleteAccountsModal from "../../../../modals/account/DeleteAccountsModal/DeleteAccountsModal";
import { IconFileImport, IconFilter, IconTrash, IconUserPlus } from "@tabler/icons-react";
import CreateAccountModal from "../../../../modals/account/CreateAccountModal/CreateAccountModal";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

const AccountTableControls = ({table, accountType, onFilteringChange}): React.JSX.Element => {
    const {tns} = useNamespaceTranslation('pages');
    const anyRowsSelected = () => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();
    const selectedUuids = table.getSelectedRowModel().rows.map(row => row.id)

    return (
        <Group justify="flex-end">
            <TableSearch
                id='details'
                setFilters={onFilteringChange}
                toggleAllRowsSelected={table.toggleAllRowsSelected}
            />
            <Button fw={400} w={100} variant="default" leftSection={<IconFilter size={16} />}>
                {tns('accounts.controls.filters')}
            </Button>
            <Button fw={400} w={180} variant="default" leftSection={<IconFileImport size={16} />}>
                {tns('accounts.controls.import-accounts')}
            </Button>
            <ModalButton
                ButtonComponent={ExpandingButton}
                ModalComponent={DeleteAccountsModal}
                modalProps={{uuids: selectedUuids}}
                mounted={anyRowsSelected()}
                w={180}
                parentGap='1rem'
                variant="filled"
                color="cherry.9"
                leftSection={<IconTrash size={16} stroke={3} />}
            >
                {tns('accounts.controls.delete-selected')}
            </ModalButton>
            <ModalButton
                ModalComponent={CreateAccountModal}
                modalProps={{ accountType }}
                w={180}
                color="black"
                variant="white"
                leftSection={<IconUserPlus size={16} stroke={3} />}
            >
                {tns('accounts.controls.create-account')}
            </ModalButton>

        </Group>
    );
}

export default AccountTableControls;