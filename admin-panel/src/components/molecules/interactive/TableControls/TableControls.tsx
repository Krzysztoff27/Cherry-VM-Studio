import { ActionIcon, Button, Group, useMatches } from "@mantine/core";
import React from "react";
import TableSearch from "../TableSearch/TableSearch";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import { IconFileImport, IconFilter, IconTrash, IconUserPlus } from "@tabler/icons-react";
import ExpandingButton from "../../../atoms/interactive/ExpandingButton/ExpandingButton";
import { TableControlsButton, TableControlsProps } from "../../../../types/components.types";

const TableControls = ({ table, onFilteringChange, modals, additionalButtons = [], translations, viewMode = false }: TableControlsProps): React.JSX.Element => {
    const anyRowsSelected = () => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();

    const buttons: TableControlsButton[] = [
        useMatches({
            base: {
                name: "filter",
                component: ActionIcon,
                props: { size: "36", variant: "default", disabled: true },
                children: <IconFilter size={20} />,
            },
            xl: {
                name: "filter",
                component: Button,
                props: { fw: 400, w: 120, variant: "default", leftSection: <IconFilter size={16} />, disabled: true },
                children: translations.filter,
            },
        }),
        useMatches({
            base: {
                name: "import",
                component: ActionIcon,
                props: { size: "36", variant: "default", disabled: true },
                children: <IconFileImport size={20} />,
            },
            xl: {
                name: "import",
                component: Button,
                props: { fw: 400, w: 140, variant: "default", leftSection: <IconFileImport size={16} />, disabled: true },
                children: translations.import,
            },
        }),
        useMatches({
            base: {
                name: "create",
                component: ActionIcon,
                props: {
                    size: 36,
                    color: "black",
                    variant: "white",
                    disabled: viewMode,
                },
                children: (
                    <IconUserPlus
                        size={20}
                        stroke={3}
                    />
                ),
            },
            lg: {
                name: "create",
                component: Button,
                props: {
                    w: 180,
                    color: "black",
                    variant: "white",
                    disabled: viewMode,
                    leftSection: (
                        <IconUserPlus
                            size={16}
                            stroke={3}
                        />
                    ),
                },
                children: translations.create,
            },
        }),
        useMatches({
            base: {
                name: "delete",
                component: ExpandingButton,
                props: {
                    ButtonComponent: ActionIcon,
                    mounted: anyRowsSelected(),
                    w: 36,
                    h: 36,
                    parentGap: "1rem",
                    variant: "filled",
                    color: "cherry.9",
                    disabled: viewMode,
                },
                children: (
                    <IconTrash
                        size={20}
                        stroke={3}
                    />
                ),
            },
            lg: {
                name: "delete",
                component: ExpandingButton,
                props: {
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
                    disabled: viewMode,
                },
                children: translations.delete,
            },
        }),
    ];

    const insertAtPos = (button: TableControlsButton) => buttons.splice(isNaN(button.position) ? buttons.length : button.position, 0, button);
    const hasModal = (buttonName: string) => !!modals[buttonName];
    additionalButtons?.forEach(insertAtPos);

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
            {buttons.map((button, i) =>
                hasModal(button.name) ? (
                    <ModalButton
                        key={i}
                        ButtonComponent={button.component}
                        buttonProps={button.props}
                        ModalComponent={modals[button.name]?.component}
                        modalProps={modals[button.name]?.props}
                    >
                        {button.children}
                    </ModalButton>
                ) : (
                    <button.component
                        key={i}
                        {...button.props}
                    >
                        {button.children}
                    </button.component>
                )
            )}
        </Group>
    );
};

export default TableControls;
