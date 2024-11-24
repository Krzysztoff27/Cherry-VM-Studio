import handleFetch from "../handlers/handleFetch.js";
import useErrorHandler from "./useErrorHandler.ts";
import {validPath} from "../utils/misc.js";
import { useApiReturn } from "../types/hooks.types.ts";

/**
 * Custom react hook for sending requests to the Cherry API
 */
export const useApi = () : useApiReturn => {
    const API_URL: string = import.meta.env.VITE_API_BASE_URL;
    const { parseAndHandleError } = useErrorHandler();

    /**
     * Combines given relative path with the base API URL
     */
    const getPath = (path: string) : string => API_URL ? `${API_URL}${validPath(path)}` : undefined;

    const sendRequest = async (
        path: string, 
        method: string, 
        options: object = {}, 
        body: object | undefined = undefined, 
        errorCallback: Function | null
    ): Promise<any> =>
        await handleFetch(getPath(path), {
            ...options,
            method: method,
            body: body,
        }, errorCallback);
    
    const getRequest    = (path: string, options = {}, errorCallback = parseAndHandleError) =>            sendRequest(path, 'GET', options, undefined, errorCallback);
    const deleteRequest = (path: string, options = {}, errorCallback = parseAndHandleError) =>            sendRequest(path, 'DELETE', options, undefined, errorCallback);
    const postRequest   = (path: string, body = {}, options = {}, errorCallback = parseAndHandleError) => sendRequest(path, 'POST', options, body, errorCallback);
    const putRequest    = (path: string, body = {}, options = {}, errorCallback = parseAndHandleError) => sendRequest(path, 'PUT', options, body, errorCallback);

    return { getPath, getRequest, postRequest, putRequest, deleteRequest };
};

export default useApi;