import { MultiSelect } from "@mantine/core";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { useTranslation } from "react-i18next";
import { safeObjectValues } from "../../../../utils/misc";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";
import classes from "./UserMultiselect.module.css";
import { UserMultiselectProps } from "../../../../types/components.types";
import { useElementSize } from "@mantine/hooks";

const UserMultiselect = ({ users, classNames, onChange, value, ...props }: UserMultiselectProps): React.JSX.Element => {
    const { ref } = useElementSize();

    const options = users.map(({ uuid, name, surname, username }) => ({
        value: uuid,
        label: name || surname ? `${name} ${surname}` : username,
    }));

    const renderOption = ({ option }) => (
        <BusinessCard
            name={option.label}
            size="sm"
        />
    );

    const onInputChange = val => {
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
            value={value}
            onChange={onInputChange}
            classNames={{
                ...classNames,
                dropdown: `border ${classNames?.dropdown}`,
                input: `${classes.clientsInput} ${classNames?.input}`,
                pill: `${classes.pill} ${classNames?.pill}`,
                option: `${classes.option} ${classNames?.option}`,
            }}
            comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
            }}
            {...props}
        />
    );
};

export default UserMultiselect;
