import { Group, Title } from "@mantine/core";
import React from "react";
import MachineControls from "../../../atoms/interactive/MachineControls/MachineControls";
import classes from "./MachineHeading.module.css";
import MachineActivityIndicator from "../../../atoms/feedback/MachineActivityIndicator/MachineActivityIndicator";
import { MachineState } from "../../../../types/api.types";

export interface MachineHeadingProps {
    machine: MachineState;
}

const MachineHeading = ({ machine }: MachineHeadingProps): React.JSX.Element => {
    const state = { fetching: machine?.active === undefined, loading: machine.loading, active: machine.active };

    return (
        <Group className={classes.container}>
            <Group className={classes.leftGroup}>
                <MachineActivityIndicator state={state} />
                <Title
                    order={2}
                    className={classes.title}
                >
                    {machine?.title ?? "Unnamed Machine"}
                </Title>
            </Group>
            <MachineControls
                machine={machine}
                state={state}
            />
        </Group>
    );
};

export default MachineHeading;
