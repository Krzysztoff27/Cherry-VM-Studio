import { useCallback, useEffect } from "react";
import useFetch from "./useFetch";

export default function usePermissions() {
    const { data: loggedInUser } = useFetch("user");

    const hasPermissions = useCallback(
        (requiredPermissions: number) =>
            loggedInUser &&
            loggedInUser?.account_type === "administrative" &&
            loggedInUser?.permissions &&
            (loggedInUser.permissions | requiredPermissions) === loggedInUser.permissions,
        [loggedInUser?.permissions]
    );

    return {
        hasPermissions,
    };
}
