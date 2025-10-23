import { Button, ButtonProps, Group, Menu, MenuProps } from "@mantine/core";
import classes from "./SplitButton.module.css";
import cs from "classnames";
import { IconChevronDown } from "@tabler/icons-react";
import { useElementSize } from "@mantine/hooks";
import { useState } from "react";

interface SplitButtonProps extends ButtonProps {
    className?: string;
    sideButtonProps?: ButtonProps;
    menuButtonsProps: ButtonProps[];
    menuProps: MenuProps;
}

const SplitButton = ({ children, className, sideButtonProps, menuButtonsProps, menuProps, ...props }: SplitButtonProps): React.JSX.Element => {
    const { ref, width } = useElementSize();
    const [opened, setOpened] = useState(false);

    return (
        <Group
            className={classes.container}
            ref={ref}
        >
            <Menu
                position="bottom-end"
                width={width || "target"}
                {...menuProps}
                classNames={{
                    ...menuProps.classNames,
                    // @ts-ignore
                    dropdown: cs(classes.menuDropdown, menuProps.classNames.dropdown),
                }}
                opened={opened}
                onChange={setOpened}
                aria-expanded={opened}
            >
                <Button
                    variant="default"
                    className={cs(classes.mainButton, className)}
                    aria-expanded={opened}
                    {...props}
                >
                    {children}
                </Button>
                <Menu.Target>
                    <Button
                        variant="default"
                        {...sideButtonProps}
                        className={cs(classes.sideButton, sideButtonProps?.className)}
                        aria-expanded={opened}
                    >
                        <IconChevronDown
                            size={24}
                            stroke={2}
                        />
                    </Button>
                </Menu.Target>
                <Menu.Dropdown aria-expanded={opened}>
                    {menuButtonsProps?.map(({ children, className, ...props }, i) => (
                        <Button
                            key={i}
                            variant="default"
                            className={cs(classes.menuButton, className)}
                            {...props}
                        >
                            {children}
                        </Button>
                    ))}
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};

export default SplitButton;
