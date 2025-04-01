import PERMISSIONS from "../config/permissions.config";
import { User } from "../types/api.types";
import { AccountType } from "../types/config.types";
import useFetch from "./useFetch";

export default function usePermissions() {
    const { data: loggedInUser } = useFetch("user");

    const hasPermissions = (requiredPermissions: number) =>
        loggedInUser?.permissions && (loggedInUser.permissions | requiredPermissions) === loggedInUser.permissions;

    return {
        hasPermissions,
    };
}
