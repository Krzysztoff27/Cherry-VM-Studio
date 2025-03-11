import { ActionIcon, Button, Group, useMatches } from "@mantine/core";
import React from "react";
import TableSearch from "../TableSearch/TableSearch";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import { IconFileImport, IconFilter, IconTrash, IconUserPlus } from "@tabler/icons-react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import ConfirmationModal from "../../../../modals/base/ConfirmationModal/ConfirmationModal";

const GroupTableControls = ({ table, onFilteringChange, refreshData }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages");
    const anyRowsSelected = () => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();
    const selectedUuids = table.getSelectedRowModel().rows.map(row => row.id);

    const createGroupButton = useMatches({
        base: {
            component: ActionIcon,
            props: {
                size: 36,
                color: "black",
                variant: "white",
            },
            children: (
                <IconUserPlus
                    size={20}
                    stroke={3}
                />
            ),
        },
        lg: {
            component: Button,
            props: {
                w: 180,
                color: "black",
                variant: "white",
                leftSection: (
                    <IconUserPlus
                        size={16}
                        stroke={3}
                    />
                ),
            },
            children: tns("accounts.controls.create-account"),
        },
    });

    const filterButton = useMatches({
        base: {
            component: ActionIcon,
            props: { size: "36", variant: "default" },
            children: <IconFilter size={20} />,
        },
        xl: {
            component: Button,
            props: { fw: 400, w: 120, variant: "default", leftSection: <IconFilter size={16} /> },
            children: tns("accounts.controls.filters"),
        },
    });

    const importButton = useMatches({
        base: {
            component: ActionIcon,
            props: { size: "36", variant: "default" },
            children: <IconFileImport size={20} />,
        },
        xl: {
            component: Button,
            props: { fw: 400, w: 140, variant: "default", leftSection: <IconFileImport size={16} /> },
            children: tns("accounts.controls.import"),
        },
    });

    const deleteButton = useMatches({
        base: {
            props: {
                buttonProps: {
                    ButtonComponent: ActionIcon,
                    mounted: anyRowsSelected(),
                    w: 36,
                    h: 36,
                    parentGap: "1rem",
                    variant: "filled",
                    color: "cherry.9",
                },
            },
            children: (
                <IconTrash
                    size={20}
                    stroke={3}
                />
            ),
        },
        lg: {
            props: {
                buttonProps: {
                    ButtonComponent: Button,
                    mounted: anyRowsSelected(),
                    w: 180,
                    parentGap: "1rem",
                    variant: "filled",
                    color: "cherry.9",
                    leftSection: (
                        <IconTrash
                            size={16}
                            stroke={3}
                        />
                    ),
                },
            },
            children: tns("accounts.controls.delete-selected"),
        },
    });

    return (
        <Group
            justify="flex-end"
            flex="1"
        >
            <TableSearch
                id="details"
                setFilters={onFilteringChange}
                toggleAllRowsSelected={table.toggleAllRowsSelected}
                maw="300"
                miw="100px"
                flex="1"
            />
            <filterButton.component {...filterButton.props}>{filterButton.children}</filterButton.component>
            <importButton.component {...importButton.props}>{importButton.children}</importButton.component>
            {/* <ModalButton
                ModalComponent={ConfirmationModal}
                buttonProps={createGroupButton.props}
                modalProps={{ onSubmit: refreshData }}
            >
                {createGroupButton.children}
            </ModalButton> */}
            {/* <ModalButton
                ModalComponent={ConfirmationModal}
                modalProps={{ onSubmit: refreshData }}
                {...deleteButton.props}
            >
                {deleteButton.children}
            </ModalButton> */}
        </Group>
    );
};

export default GroupTableControls;
