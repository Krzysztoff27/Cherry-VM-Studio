import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { useMediaQuery } from "@mantine/hooks";
import { getFullUserName } from "../../../utils/users";

const BusinessCardCell = ({ getValue }): React.JSX.Element => {
    const { avatar, email, name, surname, username } = getValue() || {};

    return (
        <BusinessCard
            imageSrc={avatar}
            comment={email}
            name={name || surname ? `${name} ${surname}` : username}
            withAvatar={useMediaQuery(`(min-width: 1200px)`)}
        />
    );
};

export const sortingFunction = (rowA: any, rowB: any, columndId: string) => {
    const detailsA = rowA.getValue(columndId);
    const detailsB = rowB.getValue(columndId);

    return getFullUserName(detailsB).localeCompare(getFullUserName(detailsA));
};

export const filterFunction = (row: any, columnId: string, filterValue: string) => {
    const details = row.getValue(columnId);
    return getFullUserName(details).toLowerCase().startsWith(filterValue.toLowerCase());
};

export default BusinessCardCell;
