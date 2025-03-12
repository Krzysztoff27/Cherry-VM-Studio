import React from "react";
import { Avatar } from "@mantine/core";

const AccountAvatarGroup = ({ uuids, max = 5 }: { uuids: string[]; max?: number }): React.JSX.Element => {
    return (
        <Avatar.Group>
            {uuids.map((uuid, index) => (
                <Avatar
                    key={index}
                    alt={uuid}
                    name={uuid}
                    color="initials"
                />
            ))}
            {uuids.length > max && <Avatar radius="xl">+{uuids.length - max}</Avatar>}
        </Avatar.Group>
    );
};

export default AccountAvatarGroup;
