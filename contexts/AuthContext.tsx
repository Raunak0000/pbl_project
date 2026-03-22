import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
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

    const logout = () => {
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