import { Stack, StackProps, Text } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceError.module.css";
import cs from "classnames";

export interface ResourceErrorProps extends StackProps {
    icon: TablerIcon;
    message: string;
}

const ResourceError = ({ icon: Icon, message, ...props }): React.JSX.Element => {
    return (
        <Stack
            {...props}
            className={cs(classes.container, props.className)}
        >
            <Icon size={48} />
            <Text fw="500">{message}</Text>
        </Stack>
    );
};

export default ResourceError;
