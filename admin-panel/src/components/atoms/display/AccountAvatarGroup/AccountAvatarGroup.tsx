import React from "react";
import { Avatar } from "@mantine/core";
import { User } from "../../../../types/api.types";

const AccountAvatarGroup = ({ users, max = 5 }: { users: User[]; max?: number }): React.JSX.Element => {
    const getFullName = (user: User) => (user.name || user.surname ? `${user.name} ${user.surname}` : user.username);

    return (
        <Avatar.Group>
            {users.map((user, index) => (
                <Avatar
                    key={index}
                    alt={getFullName(user)}
                    name={getFullName(user)}
                    color="initials"
                />
            ))}
            {users.length > max && <Avatar radius="xl">+{users.length - max}</Avatar>}
        </Avatar.Group>
    );
};

export default AccountAvatarGroup;
