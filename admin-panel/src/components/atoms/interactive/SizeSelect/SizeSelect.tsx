import { Select } from "@mantine/core";
import React from "react";
import { SizeSelectProps } from "../../../../types/components.types";

const SizeSelect = ({ sizes, value, setValue }: SizeSelectProps): React.JSX.Element => {
    const data = sizes.map(size => `${size}`); //must be passed as an array of strings

    return (
        <Select
            data={data}
            value={`${value}`}
            onChange={setValue}
            classNames={{
                input: "border",
            }}
            w="75"
            withCheckIcon={false}
            allowDeselect={false}
        />
    );
};

export default SizeSelect;
