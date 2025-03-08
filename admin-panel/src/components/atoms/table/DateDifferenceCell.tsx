import { Text } from "@mantine/core";
import React from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { timePassedRounded } from "../../../utils/dates.js";

const DateDifferenceCell = ({getValue} : {getValue: () => Date | null}) : React.JSX.Element => {
    const {tns} = useNamespaceTranslation('pages');
    
    const val = getValue();
    const [count, unit] = timePassedRounded(new Date(val));
    
    if(!val) return <Text>-</Text>
    return <Text>{tns(`accounts.table.cells.last-active.${unit}`, {count})}</Text>
}

export default DateDifferenceCell;