import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { defaultApi } from '../api/axiosInstance';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Verificar sesión activa en el backend mediante Cookie HttpOnly al cargar la app
    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await defaultApi.get('me/');
            if (response.data && response.data.isAuthenticated) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    /**
     * Inicio de sesión: No almacena tokens sensibles en localStorage/sessionStorage.
     * La autenticación reside en la cookie HttpOnly 'auth_token' emitida por el backend Django.
     */
    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    /**
     * Actualiza el estado 2FA del usuario en memoria tras activación/desactivación
     */
    const update2FAStatus = (isEnabled) => {
        setUser((prev) => (prev ? { ...prev, is_2fa_enabled: isEnabled } : prev));
    };

    /**
     * Cierre de sesión seguro:
     * Invalida la sesión y solicita al backend eliminar la cookie HttpOnly 'auth_token'.
     */
    const logout = async () => {
        try {
            await defaultApi.post('logout/');
        } catch (error) {
            console.error('[Seguridad] Error al notificar logout al backend:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuthStatus, update2FAStatus }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
