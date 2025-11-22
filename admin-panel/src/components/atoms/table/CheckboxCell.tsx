import { Checkbox } from "@mantine/core";

const CheckboxCell = ({ row }): React.JSX.Element => (
    <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        color="cherry"
    />
);

export default CheckboxCell;
