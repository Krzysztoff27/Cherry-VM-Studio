import { useEffect, useState } from "react";
import useApi from "./useApi";
import { AxiosError, AxiosRequestConfig } from "axios";

export interface useFetchReturn {
    loading: boolean;
    error: AxiosError | null;
    data: any | null;
    refresh: () => void;
}

const useFetch = (path?: string, config: AxiosRequestConfig = undefined, cleanBeforeRefresh = false): useFetchReturn => {
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<AxiosError | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshValue, setRefreshValue] = useState<boolean>(false);

    const refresh = () => {
        setRefreshValue((prev) => !prev);
    };

    const { sendRequest } = useApi();

    useEffect(() => {
        const fetchData = async () => {
            if (!path) return;
            if (cleanBeforeRefresh) setData(null);
            setError(null);
            setLoading(true);

            const onError = (error: AxiosError) => {
                setData(null);
                setError(error);
                setLoading(false);
            };

            const json = await sendRequest("GET", path, config, onError);

            if (!json) return;
            setData(json);
            setError(null);
            setLoading(false);
        };
        fetchData();
    }, [path, config, refreshValue]);

    return { loading, error, data, refresh };
};

export default useFetch;
