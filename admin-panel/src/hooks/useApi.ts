import handleFetch from "../handlers/handleFetch.js";
import useErrorHandler from "./useErrorHandler.ts";
import {validPath} from "../utils/misc.js";
import { ErrorCallbackFunction, useApiReturn } from "../types/hooks.types.ts";
import urlConfig from "../config/url.config.ts";
import useAuth from "./useAuth.ts";

/**
 * Custom react hook for sending requests to the Cherry API
 */
export const useApi = () : useApiReturn => {
    const API_URL: string = urlConfig.api_requests;
    const { parseAndHandleError } = useErrorHandler();
    const { authOptions, refreshOptions, setAccessToken, setRefreshToken } = useAuth();

    /**
     * Combines given relative path with the base API URL
     */
    const getPath = (path: string) : string => API_URL ? `${API_URL}${validPath(path)}` : undefined;

    const refreshTokens = async () => {
        return fetch(getPath('refresh'), refreshOptions)
            .then(res => res.ok && res.json())
            .then(json => {
                setAccessToken(json?.access_token);
                setRefreshToken(json?.refresh_token);
                return json?.access_token;
            })
            .catch((err) => {
                console.error('Error occured while parsing response body during token refresh.\n', err);
                return null;
            })
    }

    const sendRequest = async (
        path: string, 
        method: string, 
        options: RequestInit = {}, 
        body: BodyInit | undefined = undefined, 
        errorCallback: ErrorCallbackFunction
    ) : Promise<any> =>
        await handleFetch(getPath(path), {
            ...authOptions,
            ...options,
            method: method,
            body: body,
        }, errorCallback, refreshTokens);
    
    const getRequest    = (path: string, options = {}, errorCallback = parseAndHandleError) =>            sendRequest(path, 'GET', options, undefined, errorCallback);
    const deleteRequest = (path: string, options = {}, errorCallback = parseAndHandleError) =>            sendRequest(path, 'DELETE', options, undefined, errorCallback);
    const postRequest   = (path: string, body: BodyInit, options = {}, errorCallback = parseAndHandleError) => sendRequest(path, 'POST', options, body, errorCallback);
    const putRequest    = (path: string, body: BodyInit, options = {}, errorCallback = parseAndHandleError) => sendRequest(path, 'PUT', options, body, errorCallback);

    return { getPath, getRequest, postRequest, putRequest, deleteRequest };
};

export default useApi;