
import { User, UserRole, AuthResponse } from '../types';

// Simulating a database in localStorage
const STORAGE_KEY_USERS = 'syncSpaceUsers';

// Helper to read "DB"
const getUsers = (): User[] & { password?: string }[] => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    } catch {
        return [];
    }
};

// Helper to write "DB"
const saveUsers = (users: any[]) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBackend = {
    async login(username: string, password: string): Promise<AuthResponse> {
        await delay(800); // Fake network latency
        
        const users = getUsers();
        // In a real app, passwords would be hashed!
        const user = users.find(u => u.username === username && (u as any).password === password);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Strip password before returning
        const { password: _, ...safeUser } = user as any;
        
        return {
            user: safeUser as User,
            token: 'fake-jwt-token-' + Math.random().toString(36).substr(2),
        };
    },

    async register(username: string, email: string, password: string): Promise<AuthResponse> {
        await delay(800);

        const users = getUsers();
        
        if (users.find(u => u.username === username)) {
            throw new Error('Username already taken');
        }

        // First user is automatically ADMIN, others are USER
        const role: UserRole = users.length === 0 ? 'ADMIN' : 'USER';

        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            username,
            email,
            role,
            password, // stored in plaintext for this mock only
        };

        users.push(newUser);
        saveUsers(users);

        const { password: _, ...safeUser } = newUser;

        return {
            user: safeUser as User,
            token: 'fake-jwt-token-' + Math.random().toString(36).substr(2),
        };
    },

    async getAllUsers(): Promise<User[]> {
        await delay(500);
        const users = getUsers();
        return users.map(u => {
            const { password, ...safeUser } = u as any;
            return safeUser as User;
        });
    },

    async deleteUser(userId: string): Promise<void> {
        await delay(500);
        const users = getUsers();
        const newUsers = users.filter(u => u.id !== userId);
        saveUsers(newUsers);
    },
};
