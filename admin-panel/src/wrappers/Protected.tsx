import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch.ts";
import Loading from "../components/atoms/feedback/Loading/Loading.tsx";
import { AccountType } from "../types/config.types.ts";
import { ERRORS } from "../config/errors.config.ts";
import { isEmpty } from "lodash";
import { User } from "../types/api.types.ts";

export interface ProtectedProps {
    accountType: AccountType;
    wrongAccountTypeFallback: string;
}

export const Protected = ({ accountType, wrongAccountTypeFallback }: ProtectedProps): React.JSX.Element => {
    const { error, loading, data: user } = useFetch<User>("user");

    document.title = accountType === "administrative" ? "Cherry Admin Panel" : "Cherry Client Panel";

    if (loading) return <Loading />;

    if (error || isEmpty(user)) {
        if (error.status === ERRORS.HTTP_401_UNAUTHORIZED) return <Navigate to="/login" />;
        throw error;
    }

    if (user.account_type !== accountType) return <Navigate to={wrongAccountTypeFallback} />;

    return <Outlet />;
};

export default Protected;
