import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { useMediaQuery } from "@mantine/hooks";

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

    const fullNameA = detailsA.name || detailsA.surname ? `${detailsA.name} ${detailsA.surname}` : detailsA.username;
    const fullNameB = detailsB.name || detailsB.surname ? `${detailsB.name} ${detailsB.surname}` : detailsB.username;

    return fullNameB.localeCompare(fullNameA);
};

export const filterFunction = (row: any, columnId: string, filterValue: string) => {
    const details = row.getValue(columnId);
    const fullName = details.name || details.surname ? `${details.name} ${details.surname}` : details.username;
    return fullName.toLowerCase().startsWith(filterValue.toLowerCase());
};

export default BusinessCardCell;
