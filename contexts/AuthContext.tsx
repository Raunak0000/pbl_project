import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('syncSpaceCurrentUser');
        const savedToken = sessionStorage.getItem('syncSpaceToken');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
    }, []);

    const login = (data: AuthResponse) => {
        setUser(data.user);
        setToken(data.token);
        sessionStorage.setItem('syncSpaceCurrentUser', JSON.stringify(data.user));
        sessionStorage.setItem('syncSpaceToken', data.token);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            // still clear local session even if API call fails
        }
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('syncSpaceCurrentUser');
        sessionStorage.removeItem('syncSpaceToken');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};