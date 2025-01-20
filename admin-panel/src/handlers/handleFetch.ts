import { ERRORS } from "../assets/errors";
import { ErrorCallbackFunction } from "../types/hooks.types";



const handleFetch = async (
    URL: string, 
    options: RequestInit = {}, 
    errorCallback: ErrorCallbackFunction, 
    tryRefreshingTokens?: () => Promise<string | null>,
) => {
    if(!URL) throw {status: ERRORS.CVMM_601_INVALID_ENV_CONFIGURATION, message: 'Environmental variable "VITE_API_BASE_URL" is either not set or its value is invalid.'};
 
    const responseOnNoResponse = new Response(
        `{"detail": No response from server}`, {
            status: 503,
            headers: {'Content-Type': 'text/plain'},
        }
    );
    const fetchData = async () => await fetch(URL, options).catch(() => responseOnNoResponse);
    
    let response = await fetchData();

    if(`${response.status}` === ERRORS.HTTP_401_UNAUTHORIZED) {
        const token = await tryRefreshingTokens();
        if(token) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
            };
            response = await fetchData();
        }
    }

    // handle no content reponses
    const text = await response.text(); 
    const json = text ? JSON.parse(text) : {};

    if(!response.ok) return errorCallback(response, json);
    return json;
}

export default handleFetch;