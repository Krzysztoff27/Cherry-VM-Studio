import { Navigate, Outlet, useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch.ts";
import Loading from "../components/atoms/feedback/Loading/Loading.tsx";

export const Protected = (): React.JSX.Element => {
    const location = useLocation();
    const { error, loading, data: user } = useFetch("user");

    if (loading) return <Loading />;
    if (!error && user) return <Outlet />;

    if (error.status === 401) return <Navigate to={location.pathname === "/home" ? "/" : "/login"} />;
    throw error;
};

export default Protected;
