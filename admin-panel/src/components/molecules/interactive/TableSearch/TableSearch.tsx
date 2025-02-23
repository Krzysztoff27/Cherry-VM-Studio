import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React from "react";
import { Filter } from "../../../../types/table.types";
import { TableSearchProps } from "../../../../types/components.types";

const TableSearch = ({ setFilters, id, toggleAllRowsSelected } : TableSearchProps): React.JSX.Element => {

    const updateFilters = (value: string) => setFilters((prev: Filter[]) =>
        prev.filter(f => f.id !== id).concat({ id, value })
    );

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        toggleAllRowsSelected(false);
        updateFilters(e.currentTarget.value);
    }

    return (
        <TextInput
            w={300}
            placeholder="Search"
            leftSection={<IconSearch size={16} />}
            onChange={onChange}
        />
    );
}

export default TableSearch;