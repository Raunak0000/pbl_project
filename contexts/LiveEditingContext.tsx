import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { liveEditingService, LiveEditingEvent, ActiveEditor } from '../services/liveEditingService';
import { useAuth } from './AuthContext';

interface LiveEditingContextType {
  activeEditors: ActiveEditor[];
  getTaskEditors: (taskId: string) => ActiveEditor[];
  notifyEditing: (boardId: string, taskId: string | null) => void;
  isConnected: boolean;
}

const LiveEditingContext = createContext<LiveEditingContextType | undefined>(undefined);

export const LiveEditingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (user) {
      liveEditingService.setUser(user.id, user.username);
      setIsConnected(true);
    }
  }, [user]);

  useEffect(() => {
    // Subscribe to live editing events
    const unsubscribe = liveEditingService.subscribe('live-editing-context', (event: LiveEditingEvent) => {
      // Update active editors whenever we receive an event
      setActiveEditors(liveEditingService.getActiveEditors());
    });

    // Periodically refresh active editors
    const interval = setInterval(() => {
      setActiveEditors(liveEditingService.getActiveEditors());
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getTaskEditors = useCallback((taskId: string) => {
    return liveEditingService.getTaskEditors(taskId);
  }, []);

  const notifyEditing = useCallback((boardId: string, taskId: string | null) => {
    liveEditingService.broadcastUserEditing(boardId, taskId);
  }, []);

  return (
    <LiveEditingContext.Provider value={{ activeEditors, getTaskEditors, notifyEditing, isConnected }}>
      {children}
    </LiveEditingContext.Provider>
  );
};

export const useLiveEditing = () => {
  const context = useContext(LiveEditingContext);
  if (!context) {
    throw new Error('useLiveEditing must be used within a LiveEditingProvider');
  }
  return context;
};
