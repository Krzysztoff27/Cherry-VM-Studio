import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";

interface PermissionsContextValue {
    hasPermissions: (required: number) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user } = useFetch("user");
    const [permissions, setPermissions] = useState<number>(0);

    useEffect(() => {
        if (permissions !== user?.permissions) {
            setPermissions(user?.permissions || 0);
        }
    }, [JSON.stringify(user)]);

    const isClientAccount = (perm: number) => perm === -1;

    const hasPermissions = useCallback(
        (required: number) => permissions != null && !isClientAccount(permissions) && (permissions | required) === permissions,
        [permissions]
    );

    console.log(permissions);

    return <PermissionsContext.Provider value={{ hasPermissions }}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
    const ctx = useContext(PermissionsContext);
    if (!ctx) throw new Error("usePermissions must be used within a PermissionsProvider");
    return ctx;
};
