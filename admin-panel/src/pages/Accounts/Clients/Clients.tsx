import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Paper, Stack } from "@mantine/core";
import classes from "./Clients.module.css";
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BusinessCardCell from "../../../components/atoms/table/BusinessCardCell";
import { safeObjectValues } from "../../../utils/misc";
import CheckboxHeader from "../../../components/atoms/table/CheckboxHeader";
import CheckboxCell from "../../../components/atoms/table/CheckboxCell";
import AccountOptionsCell from "../../../components/atoms/table/AccountOptionsCell";
import useFetch from "../../../hooks/useFetch";
import Loading from "../../../components/atoms/feedback/Loading/Loading";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

const Clients = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable accountType="client" />
            </Paper>
        </Stack>
    );
};

export default Clients;
