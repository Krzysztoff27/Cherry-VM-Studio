import { MultiSelect, MultiSelectProps } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { safeObjectValues } from "../../../../utils/misc";
import useFetch from "../../../../hooks/useFetch";

const GroupMultiselect = (props: MultiSelectProps): React.JSX.Element => {
    const { data: groups } = useFetch("groups");
    const { t } = useTranslation();

    const sortOptions = (a, b) => a.label.localeCompare(b.label);

    const groupOptions = safeObjectValues(groups)
        .map(group => ({
            label: group.name,
            value: group.uuid,
        }))
        .sort(sortOptions);

    console.log(groups);

    return (
        <MultiSelect
            dropdownOpened={true}
            placeholder={t("groups")}
            data={groupOptions}
            hidePickedOptions={true}
            {...props}
            value={groupOptions.length ? props.value : []}
            nothingFoundMessage={t("nothing-found")}
        />
    );
};

export default GroupMultiselect;
