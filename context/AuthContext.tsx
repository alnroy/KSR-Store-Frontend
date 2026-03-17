"use client"
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import api from '../lib/api';
import axios from 'axios';

interface AuthContextType {
    isLoggedIn: boolean;
    user: any | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();

    const fetchUser = async (token: string) => {
        try {
            // Using the api utility which handles the Bearer token automatically
            const res = await api.get('/auth/me/');
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user", err);
            logout();
        }
    };

    // Check token on initial app load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
            fetchUser(token);
        }
    }, []);

    // Function to run when user logs in
    const login = (access: string, refresh: string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setIsLoggedIn(true);
        fetchUser(access);
    };

    // Function to run when user logs out
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}