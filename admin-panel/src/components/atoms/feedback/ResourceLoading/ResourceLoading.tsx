import { Group, Loader, Stack, StackProps, Text } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceLoading.module.css";
import cs from "classnames";

export interface ResourceLoadingProps extends StackProps {
    icon: TablerIcon;
    message: string;
}

const ResourceLoading = ({ icon: Icon, message, ...props }): React.JSX.Element => {
    return (
        <Stack
            {...props}
            className={cs(classes.container, props.className)}
        >
            <Icon size={48} />
            <Group gap="xs">
                <Text fw="500">{message}</Text>
                <Loader
                    type="dots"
                    color="white"
                    size="24"
                />
            </Group>
        </Stack>
    );
};

export default ResourceLoading;
