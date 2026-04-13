import axios from 'axios';
import { Board, Task, AuthResponse, User, ActivityLog, Comment } from '../types';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('syncSpaceToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Auth API ---
export const authApi = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/login', { username, password });
        return response.data;
    },

    register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/register', { username, email, password });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await axiosInstance.post('/auth/logout');
    },
};

// --- Board & Task API ---
export const api = {
    // --- Boards ---
    getBoards: async (): Promise<Board[]> => {
        const response = await axiosInstance.get('/board');
        return response.data;
    },

    createBoard: async (board: Omit<Board, 'id'> | Board): Promise<Board> => {
        const response = await axiosInstance.post('/board', board);
        return response.data;
    },

    deleteBoard: async (boardId: string): Promise<void> => {
        await axiosInstance.delete(`/board/${boardId}`);
    },

    // --- Tasks ---
    getTasksForBoard: async (boardId: string): Promise<Task[]> => {
        const response = await axiosInstance.get(`/tasks/board/${boardId}`);
        return response.data;
    },

    createTask: async (task: Omit<Task, 'id'> | Task): Promise<Task> => {
        const response = await axiosInstance.post('/tasks', task);
        return response.data;
    },

    updateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
        const response = await axiosInstance.put(`/tasks/${taskId}`, task);
        return response.data;
    },

    updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
        const response = await axiosInstance.patch(`/tasks/${taskId}/status?status=${status}`);
        return response.data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await axiosInstance.delete(`/tasks/${taskId}`);
    },

    getTaskLogs: async (taskId: string, page: number = 0, size: number = 20): Promise<ActivityLog[]> => {
        const response = await axiosInstance.get(`/tasks/${taskId}/logs`, {
            params: { page, size }
        });
        return response.data;
    },
};

export const adminApi = {
    getUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get('/admin/users');
        return response.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await axiosInstance.delete(`/admin/users/${userId}`);
    },

    getBoardLogs: async (boardId: string, page: number = 0, size: number = 50): Promise<ActivityLog[]> => {
        const response = await axiosInstance.get(`/admin/boards/${boardId}/logs`, {
            params: { page, size }
        });
        return response.data;
    },
};

export const commentApi = {
    getComments: async (taskId: string): Promise<Comment[]> => {
        const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
        return response.data;
    },

    addComment: async (taskId: string, content: string, boardId: string): Promise<Comment> => {
        const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { content, boardId });
        return response.data;
    },

    deleteComment: async (taskId: string, commentId: string): Promise<void> => {
        await axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}`);
    },
};