import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Parse user safely
    let parsedUser = null;
    try {
        parsedUser = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;
    } catch {
        parsedUser = null;
    }

    const [isAuthenticated, setIsAuthenticated] = useState(
        token !== null && parsedUser !== null
    );

    const [user, setUser] = useState(parsedUser);
    
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
