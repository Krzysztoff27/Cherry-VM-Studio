import { Button, Group } from "@mantine/core";
import React, { useMemo, useState } from "react";
import UserMultiselect from "../UserMultiselect/UserMultiselect";
import classes from "./AddMembersField.module.css";
import useFetch from "../../../../hooks/useFetch";
import { safeObjectValues } from "../../../../utils/misc";
import { IconUserPlus } from "@tabler/icons-react";
import useApi from "../../../../hooks/useApi";

const AddMembersField = ({ groupUuid, alreadyAddedUsers, refresh }): React.JSX.Element => {
    const { data } = useFetch("users?account_type=client");
    const [selected, setSelected] = useState([]);
    const { putRequest } = useApi();

    const addedUuids = useMemo(() => alreadyAddedUsers.map(user => user.uuid), [JSON.stringify(alreadyAddedUsers)]);
    const users = safeObjectValues(data).filter(user => !addedUuids.includes(user.uuid));

    const submit = async () => {
        await putRequest(`group/join/${groupUuid}`, JSON.stringify(selected));
        refresh();
        setSelected([]);
    };

    return (
        <Group>
            <UserMultiselect
                placeholder="Enter users to add"
                w={"calc(100% - 166px)"}
                users={users}
                classNames={classes}
                onChange={val => setSelected(val)}
                value={selected}
            />

            <Button
                w={150}
                variant="default"
                leftSection={<IconUserPlus size={20} />}
                onClick={submit}
            >
                Add User
            </Button>
        </Group>
    );
};

export default AddMembersField;
