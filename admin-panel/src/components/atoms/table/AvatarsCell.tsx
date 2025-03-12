import React from "react";
import AccountAvatarGroup from "../display/AccountAvatarGroup/AccountAvatarGroup";

const AvatarsCell = ({ getValue }): React.JSX.Element => {
    return (
        <AccountAvatarGroup
            uuids={getValue()}
            max={10}
        />
    );
};

export default AvatarsCell;
