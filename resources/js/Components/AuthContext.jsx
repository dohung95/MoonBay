import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing stored user:", error);
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);
    
    const login = (userData, authToken) => {
        // Đảm bảo userData có avatar, nếu không thì đặt mặc định
        const user = {
            ...userData,
            avatar: userData.avatar || '/images/avatar/default.png',
        };
        setUser(user);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', authToken);
        console.log('User stored in localStorage:', localStorage.getItem('user')); // Debug
        console.log('Token stored in localStorage:', localStorage.getItem('token')); // Debug
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken('');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        console.log('User and token removed from localStorage');
    };

    const updateUser = (updatedUser) => {
        const user = {
            ...updatedUser,
            avatar: updatedUser.avatar || '/images/avatar/default.png',
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Updated user stored in localStorage:', localStorage.getItem('user')); // Debug
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};