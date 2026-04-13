export type Status = 'To Do' | 'In Progress' | 'Done';

export const STATUSES: Status[] = ['To Do', 'In Progress', 'Done'];

export const TEAMS = ['Engineering', 'Design', 'Marketing', 'Product', 'Sales'];

export type Priority = 'high' | 'medium' | 'low';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string; badge: string }> = {
    high:   { label: 'High',   color: '#F85149', dot: 'bg-[#F85149]', badge: 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]' },
    medium: { label: 'Medium', color: '#D29922', dot: 'bg-[#D29922]', badge: 'bg-[#3D2E0A] text-[#D29922] border-[#5C440F]' },
    low:    { label: 'Low',    color: '#484F58', dot: 'bg-[#484F58]', badge: 'bg-[#21262D] text-[#8B949E] border-[#30363D]'  },
};

// Predefined labels users can pick from (color-coded)
export const LABEL_OPTIONS: { name: string; color: string; bg: string }[] = [
    { name: 'bug',      color: '#F85149', bg: 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]' },
    { name: 'feature',  color: '#3FB950', bg: 'bg-[#0F3D20] text-[#3FB950] border-[#1A5C2E]' },
    { name: 'urgent',   color: '#D29922', bg: 'bg-[#3D2E0A] text-[#D29922] border-[#5C440F]' },
    { name: 'design',   color: '#58A6FF', bg: 'bg-[#1E3A5F] text-[#58A6FF] border-[#2D5A8E]' },
    { name: 'research', color: '#A78BFA', bg: 'bg-[#2D1F63] text-[#A78BFA] border-[#4C3D7A]' },
    { name: 'docs',     color: '#8B949E', bg: 'bg-[#21262D] text-[#8B949E] border-[#30363D]'  },
    { name: 'backend',  color: '#F0883E', bg: 'bg-[#3D1F0A] text-[#F0883E] border-[#5C300F]' },
    { name: 'frontend', color: '#58A6FF', bg: 'bg-[#1E3A5F] text-[#58A6FF] border-[#2D5A8E]' },
];

export interface Task {
    id: string;
    boardId?: string;
    title: string;
    description: string;
    status: Status;
    assignee?: string;
    dueDate?: string;
    tags?: string[];
    team?: string;
    blockedBy?: string[];
    priority?: Priority;
    labels?: string[];
}

export interface Board {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
    columns?: Status[];
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

export interface ActivityLog {
    id: string;
    taskId: string;
    boardId: string;
    userId: string;
    username: string;
    action: string;
    oldValue: string | null;
    newValue: string | null;
    timestamp: string;
}

export interface Comment {
    id: string;
    taskId: string;
    boardId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    taskId: string;
    boardId: string;
    type: 'COMMENT' | 'ASSIGNED';
    read: boolean;
    createdAt: string;
}
