import { ActionIcon, ActionIconProps, Group, ScrollArea, ScrollAreaAutosizeProps, Stack } from "@mantine/core";
import { ReactNode } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { isBoolean } from "lodash";
import cs from "classnames";

interface ListInputProps extends ScrollAreaAutosizeProps {
    values: Array<any>;
    gap?: number | string;
    createEntryButtonProps?: ActionIconProps;
    removeEntryButtonProps?: ActionIconProps;
    canCreateEntry?: boolean;
    canRemoveEntry?: boolean | ((index: number) => boolean);
    createEntry?: () => void;
    removeEntry?: (index: number) => void;
    row: (value: any, index: number, values: Array<any>) => ReactNode;
    headerRow?: (values: Array<any>) => ReactNode;
}

const ListInput = ({
    values,
    headerRow = () => null,
    row,
    createEntry = () => {},
    removeEntry = () => {},
    canCreateEntry = true,
    canRemoveEntry = true,
    gap,
    createEntryButtonProps,
    removeEntryButtonProps,
    ...props
}: ListInputProps): React.JSX.Element => {
    return (
        <ScrollArea.Autosize {...props}>
            <Stack gap={gap}>
                {headerRow(values)}
                {...values.map((value, index) => (
                    <Group
                        key={index}
                        align="center"
                        gap="sm"
                        h="36px"
                    >
                        <ActionIcon
                            variant="default"
                            size="36px"
                            color="white"
                            onClick={() => removeEntry(index)}
                            disabled={isBoolean(canRemoveEntry) ? !canRemoveEntry : canRemoveEntry(index)}
                            {...removeEntryButtonProps}
                            className={cs("borderless", removeEntryButtonProps?.className)}
                        >
                            <IconMinus />
                        </ActionIcon>
                        {row(value, index, values)}
                    </Group>
                ))}
                <Group
                    align="center"
                    gap="sm"
                >
                    <ActionIcon
                        variant="default"
                        size="36px"
                        onClick={() => createEntry()}
                        disabled={!canCreateEntry}
                        {...createEntryButtonProps}
                        className={cs("borderless", createEntryButtonProps?.className)}
                    >
                        <IconPlus />
                    </ActionIcon>
                </Group>
            </Stack>
        </ScrollArea.Autosize>
    );
};

export default ListInput;
