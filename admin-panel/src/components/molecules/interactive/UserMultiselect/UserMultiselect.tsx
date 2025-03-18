import { MultiSelect } from "@mantine/core";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { useTranslation } from "react-i18next";
import { safeObjectValues } from "../../../../utils/misc";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";

import classes from "./UserMultiselect.module.css";
import { UserMultiselectProps } from "../../../../types/components.types";
import { useElementSize } from "@mantine/hooks";

const UserMultiselect = ({ users, classNames, onChange, ...props }: UserMultiselectProps): React.JSX.Element => {
    const { ref } = useElementSize();

    const options = safeObjectValues(users).map(({ uuid, name, surname, username }) => ({
        value: uuid,
        label: name || surname ? `${name} ${surname}` : username,
    }));

    const renderOption = ({ option }) => (
        <BusinessCard
            name={`${users[option.value].name} ${users[option.value].surname}`}
            size="sm"
        />
    );

    const onInputChange = val => {
        console.log(ref.current.parentElement.scrollWidth);
        ref.current.parentElement.parentElement.scrollTo({ left: ref.current.parentElement.parentElement.scrollWidth });
        onChange?.(val);
    };

    return (
        <MultiSelect
            ref={ref}
            data={options}
            renderOption={renderOption}
            searchable
            hidePickedOptions
            rightSectionWidth={16}
            rightSection={<></>}
            onChange={onInputChange}
            classNames={{
                ...classNames,
                dropdown: `border ${classNames?.dropdown}`,
                input: `${classes.clientsInput} ${classNames?.input}`,
                pill: `${classes.pill} ${classNames?.pill}`,
            }}
            comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
            }}
            {...props}
        />
    );
};

export default UserMultiselect;
