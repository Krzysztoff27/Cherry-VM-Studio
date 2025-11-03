import React, { createContext, useContext, useCallback, useEffect, useRef } from "react";
import useFetch from "../hooks/useFetch";
import { useAuthentication } from "./AuthenticationContext";

interface PermissionsContextValue {
    hasPermissions: (required: number) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tokens } = useAuthentication();
    const { data: permissions, refresh } = useFetch("user/permissions");
    const first = useRef(false);

    const isClientAccount = (perm: number) => perm === -1;

    useEffect(() => {
        if (tokens.access_token && !first.current) {
            first.current = true;
            refresh();
        }
    }, [tokens.access_token]);

    const hasPermissions = useCallback(
        (required: number) => permissions != null && !isClientAccount(permissions) && (permissions | required) === permissions,
        [permissions]
    );

    return <PermissionsContext.Provider value={{ hasPermissions }}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
    const ctx = useContext(PermissionsContext);

    if (!ctx) throw new Error("usePermissions must be used within a PermissionsProvider");

    return ctx;
};
