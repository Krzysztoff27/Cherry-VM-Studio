import { ScrollArea, Stack, Text, Title } from "@mantine/core";
import classes from "./ClientHomePage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { getFullUserName } from "../../../../utils/users";
import { isNull } from "lodash";
import { User } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";

const ClientHomePage = (): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "client-home");
    const { data: user, loading, error } = useFetch<User>("user");

    return (
        <ScrollArea w="100%">
            <Stack className={classes.container}>
                <Stack align="center">
                    <Title>{tns("title", { fullname: isNull(user) ? "" : getFullUserName(user) })}</Title>
                    <Text className={classes.description}>{tns("description1")}</Text>
                </Stack>
            </Stack>
        </ScrollArea>
    );
};

export default ClientHomePage;
