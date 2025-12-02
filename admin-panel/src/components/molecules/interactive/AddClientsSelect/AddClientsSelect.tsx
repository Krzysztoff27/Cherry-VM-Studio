import { useTranslation } from "react-i18next";
import useFetch from "../../../../hooks/useFetch";
import { User } from "../../../../types/api.types";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";
import { omit, values } from "lodash";
import { getFullUserName } from "../../../../utils/users";
import { Select, SelectProps } from "@mantine/core";
import cs from "classnames";
import classes from "./AddClientsSelect.module.css";
import { useMemo, useState } from "react";

export interface AddClientsSelectProps extends SelectProps {
    onSubmit: () => {};
    excludedClients: string[];
}

const AddClientsSelect = ({ onSubmit, excludedClients, classNames, ...props }): React.JSX.Element => {
    const { t } = useTranslation();
    const [value, setValue] = useState(null);

    const { data, loading, error } = useFetch<Record<string, User>>("users?account_type=client");

    const clients: User[] = useMemo(() => values(omit(data, excludedClients)) ?? [], [data, excludedClients]);

    const options = clients.map((client) => ({
        value: client.uuid,
        label: getFullUserName(client),
    }));

    const renderOption = ({ option }) => (
        <BusinessCard
            name={option.label}
            size="sm"
        />
    );

    const submit = (value: string) => {
        setValue(null);
        onSubmit(value);
    };

    return (
        <Select
            placeholder={t("enter-users-to-add")}
            value={value}
            data={options}
            renderOption={renderOption}
            searchable
            nothingFoundMessage={loading ? t("loading-users") : error ? t("error-users") : t("nothing-found")}
            onChange={submit}
            classNames={{
                ...classNames,
                dropdown: cs("border", classNames?.dropdown),
                input: cs(classes.clientsInput, classNames?.input),
                pill: cs(classes.pill, classNames?.pill),
                option: cs(classes.option, classNames?.option),
            }}
            comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
            }}
            {...props}
        />
    );
};

export default AddClientsSelect;
