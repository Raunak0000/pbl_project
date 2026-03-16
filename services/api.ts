import axios from 'axios';
import { Board, Task, AuthResponse } from '../types';

const BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('syncSpaceToken');
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
};

// --- Board & Task API ---
export const api = {
    // --- Boards ---
    getBoards: async (): Promise<Board[]> => {
        const response = await axiosInstance.get('/board');
        return response.data;
    },

    createBoard: async (board: Omit<Board, 'id'> | Board): Promise<Board> => {
        // Backend creates ID and timestamps
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
    }
};