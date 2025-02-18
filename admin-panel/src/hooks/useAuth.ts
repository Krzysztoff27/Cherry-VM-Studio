import { useMemo, useCallback } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useAuthReturn } from "../types/hooks.types";

/**
 * Custom react hook providing the application with authentication support.
 */

export default function useAuth(): useAuthReturn {
    const [cookies, setCookies] = useCookies(['access_token', 'refresh_token']);
    const navigate = useNavigate();
    
    const setToken = (tokenType: 'access_token' | 'refresh_token', newToken: string | null) => 
        setCookies(tokenType, newToken, {path: '/'})
       

    const setAccessToken = (token: string | null) => setToken('access_token', token);
    const setRefreshToken = (token: string | null) => setToken('refresh_token', token);

    const clearTokens = () => {
        setAccessToken(null);
        setRefreshToken(null);
    }

    const logout = () => {
        clearTokens();
        navigate('/login');
    }
    
    const tokens = useMemo(() => ({
        access_token: cookies.access_token,
        refresh_token: cookies.refresh_token
    }), [cookies.access_token, cookies.refresh_token]);

    const authOptions = useMemo(() => ({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookies.access_token,
            }
        }), 
        [cookies.access_token]
    );

    const refreshOptions = useMemo(() => ({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cookies.refresh_token,
        }
    }), [cookies.refresh_token])

    return {
        setAccessToken,
        setRefreshToken,
        clearTokens,
        logout,
        tokens,
        authOptions,
        refreshOptions,
    };
}