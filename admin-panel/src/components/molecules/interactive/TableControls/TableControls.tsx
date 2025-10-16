import { ActionIcon, Button, Group, Skeleton, useMatches } from "@mantine/core";
import React, { useMemo, useCallback, ComponentType } from "react";
import TableSearch from "../TableSearch/TableSearch";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import { IconFileImport, IconFilter, IconPlus, IconTrash, TablerIcon } from "@tabler/icons-react";
import ExpandingButton from "../../../atoms/interactive/ExpandingButton/ExpandingButton";
import { useMediaQuery } from "@mantine/hooks";

export interface TableControlsButton {
    name: string;
    position?: number;
    component: ComponentType<any>;
    props?: { [key: string]: any }; // button component props
    children?: any;
}

export interface TableControlsModal {
    component: ComponentType<any>;
    props?: { [key: string]: any };
}

export interface TableControlsTranslations {
    create?: string;
    delete?: string;
    import?: string;
    filter?: string;
}

export interface TableControlsIcons {
    create?: TablerIcon;
    delete?: TablerIcon;
    import?: TablerIcon;
    filter?: TablerIcon;
}

export interface TableControlsModals {
    create?: TableControlsModal;
    delete?: TableControlsModal;
    import?: TableControlsModal;
    filter?: TableControlsModal;
    [key: string]: TableControlsModal;
}

export interface TableControlsProps {
    table: any;
    modals: TableControlsModals;
    translations: TableControlsTranslations;
    additionalButtons?: TableControlsButton[];
    viewMode?: boolean;
    withImports?: boolean;
    withFilters?: boolean;
    withCreation?: boolean;
    withDeletion?: boolean;
    icons?: TableControlsIcons;
    searchColumnKey?: string;
    onFilteringChange?: (callback: (prev: any) => any) => void;
}

const TableControls = ({
    table,
    modals,
    additionalButtons = [],
    icons: customIcons = {},
    translations,
    withImports = true,
    withFilters = true,
    withCreation = true,
    withDeletion = true,
    viewMode = false,
    onFilteringChange,
    searchColumnKey = "details",
}: TableControlsProps): React.JSX.Element => {
    const isXl = useMediaQuery("(min-width: 96em)");
    const isLg = useMediaQuery("(min-width: 84em)");

    const icons = useMemo(
        () => ({
            create: IconPlus,
            delete: IconTrash,
            filter: IconFilter,
            import: IconFileImport,
            ...customIcons,
        }),
        [customIcons]
    );

    const anyRowsSelected = useCallback(() => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected(), [table]);

    let buttons: TableControlsButton[] = [];

    if (withFilters)
        buttons.push(
            isXl
                ? {
                      name: "filter",
                      component: Button,
                      props: { fw: 400, w: 120, variant: "default", leftSection: <icons.filter size={16} />, disabled: true },
                      children: translations.filter,
                  }
                : {
                      name: "filter",
                      component: ActionIcon,
                      props: { size: "36", variant: "default", disabled: true },
                      children: <icons.filter size={20} />,
                  }
        );

    if (withImports)
        buttons.push(
            isLg
                ? {
                      name: "import",
                      component: Button,
                      props: { fw: 400, w: 140, variant: "default", leftSection: <icons.import size={16} />, disabled: true },
                      children: translations.import,
                  }
                : {
                      name: "import",
                      component: ActionIcon,
                      props: { size: "36", variant: "default", disabled: true },
                      children: <icons.import size={20} />,
                  }
        );

    if (withCreation)
        buttons.push(
            isLg
                ? {
                      name: "create",
                      component: Button,
                      props: {
                          w: 180,
                          color: "black",
                          variant: "white",
                          disabled: viewMode,
                          leftSection: (
                              <icons.create
                                  size={16}
                                  stroke={3}
                              />
                          ),
                      },
                      children: translations.create,
                  }
                : {
                      name: "create",
                      component: ActionIcon,
                      props: { size: 36, color: "black", variant: "white", disabled: viewMode },
                      children: (
                          <icons.create
                              size={20}
                              stroke={3}
                          />
                      ),
                  }
        );

    if (withDeletion)
        buttons.push(
            isLg
                ? {
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
                              <icons.delete
                                  size={16}
                                  stroke={3}
                              />
                          ),
                          disabled: viewMode,
                      },
                      children: translations.delete,
                  }
                : {
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
                          <icons.delete
                              size={20}
                              stroke={3}
                          />
                      ),
                  }
        );

    const insertAtPos = (button: TableControlsButton) => buttons.splice(isNaN(button.position) ? buttons.length : button.position, 0, button);
    const hasModal = useCallback((buttonName: string) => !!modals[buttonName], [modals]);
    additionalButtons?.forEach(insertAtPos);

    return (
        <Group
            justify="flex-end"
            flex="1"
        >
            <TableSearch
                id={searchColumnKey}
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
