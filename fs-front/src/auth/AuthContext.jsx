// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('token') !== null // Verifica si hay un token guardado
    );

    const login = (token) => {
        localStorage.setItem('token', token); // Guarda el token en localStorage
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token'); // Elimina el token
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);