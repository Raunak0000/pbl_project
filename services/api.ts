import axios from 'axios';
import { Board, Task } from '../types';

const BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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