import { ActionIconProps, ButtonProps, ModalProps, StackProps, TextInputProps, TextProps, TitleProps } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import { ComponentType, MouseEventHandler } from "react";
import { SparklineProps } from "@mantine/charts";
import { PopoverProps } from "@mantine/core";
import { MachineData, MachineState, MachineStates, User } from "./api.types";

export interface StateDividerProps {
    label: MachineStates;
}

export interface TextWithIconProps extends TextProps {
    Icon: TablerIcon;
    text: string;
}

export interface ConnectButtonProps {
    active: boolean;
    label: string;
    onClick: React.MouseEventHandler;
}

export interface MediumPanelButonProps extends ButtonProps {
    Icon: TablerIcon;
    label: string;
    onClick?: MouseEventHandler;
}

export interface NavButtonProps {
    label: string; // aria-label
    active?: boolean; // is currently selected? default = false
    icon: React.ReactElement;
    [x: string]: unknown;
}

export interface MachineTitleProps extends TitleProps {
    machine: MachineData;
}

export interface MachineControlsProps {
    currentState: MachineState;
    size?: string | number | null | undefined;
}

export interface SparklineWithTextProps extends Omit<SparklineProps, "data"> {
    label: string;
    chartData: Array<number>;
}

export interface MachineConnectionDetailsProps {
    active?: boolean;
    machine: MachineData;
}

export interface CollapsibleGroupToggleProps {
    toggleOpened: React.MouseEventHandler;
    opened: boolean;
    label: string;
}

export interface PopoverRadioGroupProps extends Omit<PopoverProps, "value" | "onChange" | "classNames"> {
    value: string;
    options: { value: string; label: string }[];
    // target: React.JSX.Element;
    classNames?: {
        popoverDropdown?: string;
        radioLabel?: string;
    };
    onValueChange: (value: string) => void;
    opened?: boolean | null;
}

export interface MachineStateChartData {
    cpu: number;
    ram_used: number;
    ram_max: number;
    time?: number;
}

export interface MachineCardProps {
    machine: MachineData;
    currentState: MachineState;
    /** The navigation path where clicking the card should redirect the user. */
    to: string;
}

export interface MachineHeadingProps {
    machine: MachineData;
    currentState: MachineState;
}

export interface CardGroupProps {
    children: React.ReactElement[];
    group: string;
    opened: boolean;
    toggleOpened: React.MouseEventHandler;
}

export interface TextFieldModalProps {
    opened: boolean;
    title: string;
    children: React.JSX.Element;
    inputProps?: TextInputProps | null;
    initialValue?: string;
    error?: string;
    onValidate?: (val: string) => boolean | null;
    onConfirm: (val: string) => any;
    onCancel: () => any;
}

export interface AddSnapshotButton {
    postSnapshot: (name: string, errorCallback?: Function | undefined) => void;
    initiateSnapshotDataUpdate: () => void;
}

export interface ApplyButtonProps extends ButtonProps {
    onClick: () => void;
    isDirty?: boolean | null;
}

export interface RestoreButtonProps {
    onConfirm: () => void;
    buttonProps: ButtonProps;
    modalProps: object;
}

export interface ConfirmationModalProps {
    opened: boolean;
    modalProps?: ModalProps;
    message?: string;
    title?: string;
    cancelButtonProps?: ButtonProps;
    confirmButtonProps?: ButtonProps;
    onClose: () => void;
    onConfirm: () => void;
}

export interface ApplyRestoreButtonProps {
    isDirty: boolean | null;
    applyNetworkConfig: () => any;
    resetFlow: () => any;
}

export interface RefreshFlowMachinesButtonProps {
    refreshMachines: () => void;
    isDirty: boolean | null;
}

export interface SnapshotSelectProps {
    loadSnapshot: (uuid: string) => void;
    loadPreset: (uuid: string) => void;
    forceSnapshotDataUpdate: boolean;
}

export interface ContentTableProps {
    headers: any[];
    rows: any[][];
}

export interface BusinessCardProps {
    imageSrc?: string;
    name: string;
    alt?: string;
    comment?: string;
    link?: string;
    withAvatar?: boolean;
    size?: string;
}

export interface CellProps {
    getValue: () => any;
    renderValue: () => any;
}

export interface TableSearchProps {
    id: string;
    setFilters: (prev: any) => any;
    toggleAllRowsSelected: (val: boolean) => void;
    [x: string]: any;
}

export interface ModalButtonProps {
    ModalComponent: ComponentType<{ opened: boolean; onClose: () => void }>;
    ButtonComponent?: ComponentType<any>;
    modalProps?: any;
    buttonProps?: any;
    children: any;
}

export interface ExpandingButtonProps extends ButtonProps {
    ButtonComponent?: ComponentType<any>;
    parentGap: string; // the gap property in the parent flex container
    mounted: boolean;
    children: any;
    ease: string;
    duration: number;
    w: number;
}

export interface SizeSelectProps {
    sizes: number[];
    value: number;
    setValue: (prev: number | string) => any;
}

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
    onFilteringChange: (callback: (prev: any) => any) => void;
}

export interface TableStateHeadingProps {
    getIsSomeRowsSelected: () => boolean;
    getIsAllRowsSelected: () => boolean;
    getCoreRowModel: () => any;
    getSelectedRowModel: () => any;
    getRowCount: () => number;
    translations: {
        all: string;
        selected: string;
        filtered: string;
    };
}

export interface PermissionProps extends StackProps {
    user: User;
}
