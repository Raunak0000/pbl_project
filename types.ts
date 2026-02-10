
export type Status = 'To Do' | 'In Progress' | 'Done';

export const STATUSES: Status[] = ['To Do', 'In Progress', 'Done'];

export const TEAMS = ['Engineering', 'Design', 'Marketing', 'Product', 'Sales'];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  assignee?: string; // User ID or Name
  dueDate?: string; // YYYY-MM-DD format
  tags?: string[];
  team?: string;
}

export interface Board {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
    columns?: Status[]; // Order of columns
}

export interface ChatMessage {
    id: string;
    boardId: string;
    channel: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
}

// --- Auth & Backend Types ---

export type UserRole = 'ADMIN' | 'USER';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    user: User;
    token: string;
}