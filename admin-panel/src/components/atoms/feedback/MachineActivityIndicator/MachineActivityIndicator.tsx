import { Indicator, IndicatorProps } from "@mantine/core";
import { IconDeviceDesktop, IconDeviceDesktopOff } from "@tabler/icons-react";

export interface MachineActivityIndicatorProps extends IndicatorProps {
    state: {
        fetching: boolean;
        loading: boolean;
        active: boolean;
    };
    iconProps?: any;
}

const MachineActivityIndicator = ({ state, iconProps, ...props }: MachineActivityIndicatorProps): React.JSX.Element => {
    const IconComponent = state.fetching || state.loading || state.active ? IconDeviceDesktop : IconDeviceDesktopOff;

    return (
        <Indicator
            position="bottom-end"
            color={state.fetching ? "orange.6" : state.loading ? "yellow" : state.active ? "suse-green.7" : "cherry"}
            withBorder={false}
            size="8"
            zIndex={3}
            {...props}
        >
            <IconComponent
                size={28}
                {...iconProps}
            />
        </Indicator>
    );
};

export default MachineActivityIndicator;
