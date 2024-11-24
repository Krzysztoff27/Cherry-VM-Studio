import { useEffect, useState } from "react";
import useApi from "./useApi";
import { useFetchReturn } from "../types/hooks.types";


const useFetch = (path: string, options: object | undefined = undefined): useFetchReturn => {
    const [data, setData] = useState<object | null>(null);
    const [error, setError] = useState<Error | Response | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshValue, setRefreshValue] = useState<boolean>(false);

    const refresh = () => setRefreshValue(prev => !prev);

    const { getPath } = useApi();
    const fetchURL = getPath(path);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(fetchURL, options)
                    .catch(err => new Response(null, {
                        status: 503,
                        statusText: 'No response from the server',
                        headers: {
                            'Content-Type': 'text/plain'
                        }
                    }));

                if (!response.ok) {
                    setData(null);
                    setError(response);
                    setLoading(false);
                }
                else {
                    const json = await response.json();
                    setData(json);
                    setError(null);
                    setLoading(false);
                }
            } catch (err) {
                setData(null);
                setError(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [path, options, refreshValue]);

    return { loading, error, data, refresh };
}

export default useFetch;