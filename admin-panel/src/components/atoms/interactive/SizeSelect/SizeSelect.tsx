import { Select } from "@mantine/core";
import React from "react";
import { SizeSelectProps } from "../../../../types/components.types";

const SizeSelect = ({ sizes, value, setValue }: SizeSelectProps): React.JSX.Element => {
    const data = sizes.map(size => `${size}`); //must be passed as an array of strings

    return (
        <Select
            w="75"
            withCheckIcon={false}
            data={data}
            value={`${value}`}
            onChange={setValue}
            radius="sm"
            className="border"
            styles={{
                input: {
                    backgroundColor: "var(--mantine-color-dark-6)",
                },
            }}
        />
    );
};

export default SizeSelect;
