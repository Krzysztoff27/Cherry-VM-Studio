import { Button, Group } from "@mantine/core";
import React from "react";
import UserMultiselect from "../../molecules/interactive/UserMultiselect/UserMultiselect";
import classes from "./AddMembersField.module.css";

const AddMembersField = ({ users }): React.JSX.Element => {
    return (
        <Group flex="1">
            <UserMultiselect
                placeholder="Enter users to add"
                w={"calc(100% - 136px)"}
                users={users}
                classNames={classes}
            />

            <Button
                w={120}
                variant="default"
            >
                Add User
            </Button>
        </Group>
    );
};

export default AddMembersField;
