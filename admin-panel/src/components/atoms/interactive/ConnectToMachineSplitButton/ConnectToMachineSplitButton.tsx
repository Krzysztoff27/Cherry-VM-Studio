import { IconDeviceDesktop, IconTerminal2 } from "@tabler/icons-react";
import SplitButton, { SplitButtonProps } from "../SplitButton/SplitButton";
import classes from "./ConnectToMachineSplitButton.module.css";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { MachineData, SimpleState } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";
import { merge } from "lodash";

export interface ConnectToMachineSplitButtonProps extends SplitButtonProps {
    machine: MachineData;
    state: SimpleState;
}

const ConnectToMachineSplitButton = ({ machine, state, ...props }: ConnectToMachineSplitButtonProps): React.JSX.Element => {
    const { t } = useTranslation();
    const { data: user } = useFetch("user");
    const { canConnectToMachine } = usePermissions();

    const canConnect = canConnectToMachine(user, machine) && !state.fetching && !state.loading && state.active;

    return (
        <SplitButton
            variant="light"
            color="gray"
            disabled={!canConnect}
            className={classes.connectButton}
            leftSection={<IconDeviceDesktop size={18} />}
            {...props}
            sideButtonProps={merge(
                {
                    className: classes.connectButton,
                    disabled: !canConnect,
                    variant: "light",
                    color: "gray",
                },
                props?.sideButtonProps
            )}
            menuProps={merge(
                {
                    classNames: { dropdown: classes.connectButtonMenu },
                    offset: 0,
                },
                props?.menuProps
            )}
            menuButtonsProps={merge(
                [
                    {
                        children: t("connect-via-vnc"),
                        leftSection: <IconDeviceDesktop size={18} />,
                        justify: "left",
                        className: classes.menuButton,
                        variant: "light",
                        color: "gray",
                    },
                    {
                        children: t("connect-via-ssh"),
                        leftSection: <IconTerminal2 size={18} />,
                        justify: "left",
                        className: classes.menuButton,
                        variant: "light",
                        color: "gray",
                    },
                ],
                props?.menuButtonsProps
            )}
        >
            {t("connect-via-rdp")}
        </SplitButton>
    );
};

export default ConnectToMachineSplitButton;
