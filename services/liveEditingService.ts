import { io, Socket } from 'socket.io-client';
import { Task, Board } from '../types';

// Live editing events
export type LiveEditingEvent = 
  | { type: 'TASK_UPDATE'; payload: { boardId: string; taskId: string; updates: Partial<Task>; userId: string } }
  | { type: 'TASK_CREATE'; payload: { boardId: string; task: Task; userId: string } }
  | { type: 'TASK_DELETE'; payload: { boardId: string; taskId: string; userId: string } }
  | { type: 'BOARD_UPDATE'; payload: { boardId: string; updates: Partial<Board>; userId: string } }
  | { type: 'USER_EDITING'; payload: { boardId: string; taskId: string | null; userId: string; userName: string } }
  | { type: 'USER_LEFT'; payload: { userId: string } };

export interface ActiveEditor {
  userId: string;
  userName: string;
  taskId: string | null;
  timestamp: number;
}

class LiveEditingService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<(event: LiveEditingEvent) => void>> = new Map();
  private activeEditors: Map<string, ActiveEditor> = new Map(); // userId -> ActiveEditor
  private currentUserId: string = '';
  private currentUserName: string = '';
  private isSimulated: boolean = true; // Set to true for local simulation

  constructor() {
    if (this.isSimulated) {
      // Simulated mode: broadcast events locally via custom event system
      this.setupSimulatedMode();
    } else {
      // Real WebSocket mode (commented out for now)
      // this.connect();
    }
  }

  private setupSimulatedMode() {
    // Handle storage events from other tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'liveEditingEvent' && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          this.handleIncomingEvent(event);
        } catch (error) {
          console.error('Failed to parse live editing event:', error);
        }
      }
    };
    
    window.addEventListener('storage', storageHandler);

    // Handle custom events from same tab
    const customEventHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        this.handleIncomingEvent(customEvent.detail);
      }
    };
    
    window.addEventListener('live-editing-event', customEventHandler);

    // Cleanup old editors every 5 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];
      Array.from(this.activeEditors.entries()).forEach(([userId, editor]) => {
        if (now - editor.timestamp > 10000) { // 10 seconds timeout
          toDelete.push(userId);
        }
      });
      
      toDelete.forEach(userId => {
        this.activeEditors.delete(userId);
        this.broadcastEvent({ 
          type: 'USER_LEFT', 
          payload: { userId } 
        });
      });
    }, 5000);

    // Store cleanup function for later
    (this as any)._cleanupInterval = cleanupInterval;
    (this as any)._storageHandler = storageHandler;
    (this as any)._customEventHandler = customEventHandler;
  }

  private connect() {
    // For future WebSocket implementation
    // this.socket = io('http://localhost:3001');
    // this.socket.on('live-editing-event', this.handleIncomingEvent.bind(this));
  }

  public setUser(userId: string, userName: string) {
    this.currentUserId = userId;
    this.currentUserName = userName;
  }

  public broadcastTaskUpdate(boardId: string, taskId: string, updates: Partial<Task>) {
    this.broadcastEvent({
      type: 'TASK_UPDATE',
      payload: { boardId, taskId, updates, userId: this.currentUserId }
    });
  }

  public broadcastTaskCreate(boardId: string, task: Task) {
    this.broadcastEvent({
      type: 'TASK_CREATE',
      payload: { boardId, task, userId: this.currentUserId }
    });
  }

  public broadcastTaskDelete(boardId: string, taskId: string) {
    this.broadcastEvent({
      type: 'TASK_DELETE',
      payload: { boardId, taskId, userId: this.currentUserId }
    });
  }

  public broadcastBoardUpdate(boardId: string, updates: Partial<Board>) {
    this.broadcastEvent({
      type: 'BOARD_UPDATE',
      payload: { boardId, updates, userId: this.currentUserId }
    });
  }

  public broadcastUserEditing(boardId: string, taskId: string | null) {
    const editor: ActiveEditor = {
      userId: this.currentUserId,
      userName: this.currentUserName,
      taskId,
      timestamp: Date.now()
    };
    this.activeEditors.set(this.currentUserId, editor);
    
    this.broadcastEvent({
      type: 'USER_EDITING',
      payload: { 
        boardId, 
        taskId, 
        userId: this.currentUserId, 
        userName: this.currentUserName 
      }
    });
  }

  public getActiveEditors(): ActiveEditor[] {
    return Array.from(this.activeEditors.values())
      .filter(editor => editor.userId !== this.currentUserId);
  }

  public getTaskEditors(taskId: string): ActiveEditor[] {
    return this.getActiveEditors().filter(editor => editor.taskId === taskId);
  }

  private broadcastEvent(event: LiveEditingEvent) {
    if (this.isSimulated) {
      // Dispatch to current tab immediately via custom event
      window.dispatchEvent(new CustomEvent('live-editing-event', { detail: event }));
      
      // Use localStorage to broadcast to other tabs
      // Store with timestamp to ensure update detection
      const timestamp = Date.now();
      localStorage.setItem('liveEditingEvent', JSON.stringify({ ...event, _timestamp: timestamp }));
      
      // Clear after a short delay to allow other tabs to read it
      setTimeout(() => {
        localStorage.removeItem('liveEditingEvent');
      }, 100);
    } else if (this.socket) {
      this.socket.emit('live-editing-event', event);
      // Also dispatch locally for current tab
      window.dispatchEvent(new CustomEvent('live-editing-event', { detail: event }));
    }
  }

  private handleIncomingEvent(event: LiveEditingEvent) {
    const isOwnEvent = 'userId' in event.payload && event.payload.userId === this.currentUserId;
    
    // Update active editors for all USER_EDITING and USER_LEFT events
    if (event.type === 'USER_EDITING') {
      this.activeEditors.set(event.payload.userId, {
        userId: event.payload.userId,
        userName: event.payload.userName,
        taskId: event.payload.taskId,
        timestamp: Date.now()
      });
    } else if (event.type === 'USER_LEFT') {
      this.activeEditors.delete(event.payload.userId);
    }

    // Always notify handlers, even for our own events
    // (They may come from other tabs and we need to keep state in sync)
    this.eventHandlers.forEach(handlers => {
      handlers.forEach(handler => handler(event));
    });
  }

  public subscribe(id: string, handler: (event: LiveEditingEvent) => void) {
    if (!this.eventHandlers.has(id)) {
      this.eventHandlers.set(id, new Set());
    }
    this.eventHandlers.get(id)!.add(handler);

    // Explicitly listen to custom events for current tab
    const customEventHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handler(customEvent.detail);
      }
    };
    
    window.addEventListener('live-editing-event', customEventHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(id);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(id);
        }
      }
      window.removeEventListener('live-editing-event', customEventHandler);
    };
  }

  public unsubscribe(id: string) {
    this.eventHandlers.delete(id);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.eventHandlers.clear();
    this.activeEditors.clear();
  }
}

export const liveEditingService = new LiveEditingService();
