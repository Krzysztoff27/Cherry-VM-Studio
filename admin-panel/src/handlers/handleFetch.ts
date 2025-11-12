import { ERRORS } from "../config/errors.config";
import { ErrorCallbackFunction } from "../types/hooks.types";

const handleFetch = async (
    URL: string,
    options: RequestInit = {},
    errorCallback: ErrorCallbackFunction,
    tryRefreshingTokens?: () => Promise<string | null>
) => {
    const responseOnNoResponse = new Response(`{"detail": "No response from server"}`, {
        status: 503,
        headers: { "Content-Type": "text/plain" },
    });

    const fetchData = async () => await fetch(URL, options).catch(() => responseOnNoResponse);

    let response = await fetchData();

    if (`${response.status}` === ERRORS.HTTP_401_UNAUTHORIZED) {
        const token = await tryRefreshingTokens();
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
            response = await fetchData();
        }
    }

    // handle no content reponses
    let json: object;

    try {
        const text = await response.text();
        json = text ? JSON.parse(text) : {};
    } catch (err) {
        console.error(`Couldn't parse request response. URL=${URL}`, err);
    }

    if (!response.ok) return errorCallback(response, json);
    return json;
};

export default handleFetch;
