import React, { createContext, useContext, useCallback } from "react";
import useFetch from "../hooks/useFetch";

interface PermissionsContextValue {
    hasPermissions: (required: number) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: permissions } = useFetch("user/permissions");

    const isClientAccount = (perm: number) => perm === -1;

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
