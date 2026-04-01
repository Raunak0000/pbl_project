import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Task, Board } from '../types';

export type LiveEditingEvent =
  | { type: 'TASK_UPDATE'; payload: { boardId: string; taskId: string; updates: Partial<Task>; userId: string } }
  | { type: 'TASK_CREATE'; payload: { boardId: string; task: Task; userId: string } }
  | { type: 'TASK_DELETE'; payload: { boardId: string; taskId: string; userId: string } }
  | { type: 'BOARD_UPDATE'; payload: { boardId: string; updates: Partial<Board>; userId: string } }
  | { type: 'BOARD_DELETE'; payload: { boardId: string; userId: string } }
  | { type: 'USER_EDITING'; payload: { boardId: string; taskId: string | null; userId: string; userName: string } }
  | { type: 'USER_LEFT'; payload: { userId: string } };

export interface ActiveEditor {
  userId: string;
  userName: string;
  taskId: string | null;
  timestamp: number;
}

class LiveEditingService {
  private client: Client | null = null;
  private eventHandlers: Map<string, Set<(event: LiveEditingEvent) => void>> = new Map();
  private activeEditors: Map<string, ActiveEditor> = new Map();
  private currentUserId: string = '';
  private currentUserName: string = '';
  private isConnected: boolean = false;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.connect();
    this.startCleanup();
  }

  private connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.isConnected = true;
        this.client!.subscribe('/topic/live-editing', (message: IMessage) => {
          try {
            const event: LiveEditingEvent = JSON.parse(message.body);
            this.handleIncomingEvent(event);
          } catch (e) {
            console.error('Failed to parse WebSocket event:', e);
          }
        });
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Array.from(this.activeEditors.entries()).forEach(([userId, editor]) => {
        if (now - editor.timestamp > 10000) {
          this.activeEditors.delete(userId);
          this.notifyHandlers({ type: 'USER_LEFT', payload: { userId } });
        }
      });
    }, 5000);
  }

  public setUser(userId: string, userName: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
  }

  private broadcastEvent(event: LiveEditingEvent) {
    // Always update local state immediately
    this.handleIncomingEvent(event);

    // Send to server if connected (server will broadcast to all OTHER clients)
    if (this.isConnected && this.client?.connected) {
      this.client.publish({
        destination: '/app/live-editing',
        body: JSON.stringify(event),
      });
    }
  }

  private handleIncomingEvent(event: LiveEditingEvent) {
    if (event.type === 'USER_EDITING') {
      this.activeEditors.set(event.payload.userId, {
        userId: event.payload.userId,
        userName: event.payload.userName,
        taskId: event.payload.taskId,
        timestamp: Date.now(),
      });
    } else if (event.type === 'USER_LEFT') {
      this.activeEditors.delete(event.payload.userId);
    }

    this.notifyHandlers(event);
  }

  private notifyHandlers(event: LiveEditingEvent) {
    this.eventHandlers.forEach(handlers => {
      handlers.forEach(handler => handler(event));
    });
  }

  public broadcastTaskUpdate(boardId: string, taskId: string, updates: Partial<Task>) {
    this.broadcastEvent({
      type: 'TASK_UPDATE',
      payload: { boardId, taskId, updates, userId: this.currentUserId },
    });
  }

  public broadcastTaskCreate(boardId: string, task: Task) {
    this.broadcastEvent({
      type: 'TASK_CREATE',
      payload: { boardId, task, userId: this.currentUserId },
    });
  }

  public broadcastTaskDelete(boardId: string, taskId: string) {
    this.broadcastEvent({
      type: 'TASK_DELETE',
      payload: { boardId, taskId, userId: this.currentUserId },
    });
  }

  public broadcastBoardUpdate(boardId: string, updates: Partial<Board>) {
    this.broadcastEvent({
      type: 'BOARD_UPDATE',
      payload: { boardId, updates, userId: this.currentUserId },
    });
  }

  public broadcastBoardDelete(boardId: string) {
    this.broadcastEvent({
      type: 'BOARD_DELETE',
      payload: { boardId, userId: this.currentUserId },
    });
  }

  public broadcastUserEditing(boardId: string, taskId: string | null) {
    const editor: ActiveEditor = {
      userId: this.currentUserId,
      userName: this.currentUserName,
      taskId,
      timestamp: Date.now(),
    };
    this.activeEditors.set(this.currentUserId, editor);

    this.broadcastEvent({
      type: 'USER_EDITING',
      payload: {
        boardId,
        taskId,
        userId: this.currentUserId,
        userName: this.currentUserName,
      },
    });
  }

  public getActiveEditors(): ActiveEditor[] {
    return Array.from(this.activeEditors.values())
      .filter(editor => editor.userId !== this.currentUserId);
  }

  public getTaskEditors(taskId: string): ActiveEditor[] {
    return this.getActiveEditors().filter(editor => editor.taskId === taskId);
  }

  public subscribe(id: string, handler: (event: LiveEditingEvent) => void) {
    if (!this.eventHandlers.has(id)) {
      this.eventHandlers.set(id, new Set());
    }
    this.eventHandlers.get(id)!.add(handler);

    return () => {
      const handlers = this.eventHandlers.get(id);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(id);
        }
      }
    };
  }

  public unsubscribe(id: string) {
    this.eventHandlers.delete(id);
  }

  public disconnect() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.client) this.client.deactivate();
    this.eventHandlers.clear();
    this.activeEditors.clear();
  }
}

export const liveEditingService = new LiveEditingService();