import { Box, Group, Slider, SliderProps, Stack, Text } from "@mantine/core";
import classes from "./EnhancedSlider.module.css";
import cs from "classnames";
import { ReactNode } from "react";

interface EnhancedSliderProps extends SliderProps {
    heading: ReactNode;
    label: (value: number) => ReactNode;
}

const EnhancedSlider = ({ label, heading, value, max, children, className, ...props }: EnhancedSliderProps): React.JSX.Element => {
    return (
        <Stack
            gap="0"
            className={cs(classes.container, className)}
        >
            <Text
                fw="500"
                size="sm"
            >
                {heading}
            </Text>
            <Group
                align="center"
                gap="sm"
            >
                <Box flex="1">
                    <Slider
                        max={max}
                        value={value}
                        {...props}
                    />
                </Box>
                <Box>
                    <Text
                        fw="500"
                        size="sm"
                    >
                        {label(value)} / {label(max)}
                    </Text>
                </Box>
            </Group>
        </Stack>
    );
};

export default EnhancedSlider;
