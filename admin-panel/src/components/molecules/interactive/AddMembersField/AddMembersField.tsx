import { Button, Group } from "@mantine/core";
import React, { useMemo, useState } from "react";
import UserMultiselect from "../UserMultiselect/UserMultiselect";
import classes from "./AddMembersField.module.css";
import useFetch from "../../../../hooks/useFetch";
import { safeObjectValues } from "../../../../utils/misc";
import { IconUserPlus } from "@tabler/icons-react";
import useApi from "../../../../hooks/useApi";
import { useTranslation } from "react-i18next";

const AddMembersField = ({ groupUuid, alreadyAddedUsers, refresh }): React.JSX.Element => {
    const { data } = useFetch("users?account_type=client");
    const { t } = useTranslation();
    const { sendRequest } = useApi();
    const [selected, setSelected] = useState([]);

    const addedUuids = useMemo(() => alreadyAddedUsers.map((user) => user.uuid), [JSON.stringify(alreadyAddedUsers)]);
    const users = safeObjectValues(data).filter((user) => !addedUuids.includes(user.uuid));

    const submit = async () => {
        await sendRequest("PUT", `group/join/${groupUuid}`, { data: selected });
        refresh();
        setSelected([]);
    };

    return (
        <Group>
            <UserMultiselect
                placeholder={selected.length ? "" : t("enter-users-to-add")}
                w={"calc(100% - 136px)"}
                users={users}
                classNames={classes}
                onChange={(val) => setSelected(val)}
                value={selected}
            />

            <Button
                w={120}
                variant="default"
                leftSection={<IconUserPlus size={20} />}
                onClick={submit}
            >
                {t("add")}
            </Button>
        </Group>
    );
};

export default AddMembersField;
