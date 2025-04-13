import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { Stack } from "@mantine/core";
import AvatarsCell from "./AvatarsCell";

const MachineAssignedUserCell = ({ getValue }): React.JSX.Element => {
    const users = getValue().filter(e => e);

    if (!users?.length) return <></>;
    if (users.length === 1)
        return (
            <BusinessCard
                name={users[0].name || users[0].surname ? `${users[0].name} ${users[0].surname}` : users[0].username}
                comment={users[0].email}
                size="md"
            />
        );

    return <AvatarsCell getValue={getValue} />;
};

export default MachineAssignedUserCell;
