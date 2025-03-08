import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { useMediaQuery } from "@mantine/hooks";

const BusinessCardCell = ({ getValue }): React.JSX.Element => {
    const { avatar, email, name, surname, username } = getValue() || {};

    console.log(useMediaQuery(`(min-width: 1200px)`));

    return (
        <BusinessCard
            imageSrc={avatar}
            comment={email}
            name={`${name} ${surname}`}
            withAvatar={useMediaQuery(`(min-width: 1200px)`)}
        />
    );
};

export default BusinessCardCell;
