import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";

const BuisnessCardCell = ({getValue}) : React.JSX.Element => {
    const { avatar, email, name, surname } = getValue() || {};

    return <BusinessCard
        imageSrc={avatar}
        comment={email}
        name={`${name} ${surname}`}
    />
}

export default BuisnessCardCell;