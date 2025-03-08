import { useEffect, useState } from "react";
import useApi from "./useApi";
import { useFetchReturn } from "../types/hooks.types";

const useFetch = (path: string, options: object | undefined = undefined): useFetchReturn => {
    const [data, setData] = useState<{ [x: string]: any } | null>(null);
    const [error, setError] = useState<Response | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshValue, setRefreshValue] = useState<boolean>(false);

    const refresh = () => setRefreshValue(prev => !prev);

    const { getRequest } = useApi();

    useEffect(() => {
        const fetchData = async () => {
            setError(null);

            const onError = (response: Response, body: object) => {
                setData(null);
                setError(response);
                setLoading(false);
            };

            const json = await getRequest(path, options, onError);

            if (!json) return;
            setData(json);
            setError(null);
            setLoading(false);
        };
        fetchData();
    }, [path, options, refreshValue]);

    return { loading, error, data, refresh };
};

export default useFetch;
