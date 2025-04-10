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

export default BusinessCardCell;
