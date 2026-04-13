
import React, { useEffect, useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { Board, TEAMS, Notification } from '../types';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import { liveEditingService, LiveEditingEvent } from '../services/liveEditingService';
import { notificationApi } from '../services/api';
import PresenceIndicator from './PresenceIndicator';
import CommandPalette, { CommandPaletteItem } from './CommandPalette';
import { ArrowLeft, Plus, Search, LogOut, Layout, Calendar as CalendarIcon, Users, Bell, MessageSquare, UserPlus } from 'lucide-react';

type View = 'kanban' | 'calendar';

interface HeaderProps {
  boardName: string;
  currentView: View;
  setView: (view: View) => void;
  onNewTask: () => void;
  onGoBack: () => void;
  onGoToLanding: () => void;
  onLogout: () => void;
  viewContext: string;
  setViewContext: (context: string) => void;
  boards?: Board[];
  onSelectBoard?: (boardId: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  boardName,
  currentView,
  setView,
  onNewTask,
  onGoBack,
  onGoToLanding,
  onLogout,
  viewContext,
  setViewContext,
  boards = [],
  onSelectBoard
}) => {
  const { activeEditors } = useLiveEditing();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifs = async () => {
      try {
        const notifs = await notificationApi.getNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifs();

    // Subscribe to STOMP events for real-time notifications
    const unsubscribe = liveEditingService.subscribe('header-notifications', (event: LiveEditingEvent) => {
      if (event.type === 'NOTIFICATION_ADDED') {
        const notif = event.payload as unknown as Notification;
        setNotifications(prev => [notif, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id: string, boardId: string, taskId: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      // Optional: if onSelectBoard is provided, navigate
      if (onSelectBoard) onSelectBoard(boardId);
      setIsNotifOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const commandItems: CommandPaletteItem[] = useMemo(() => {
    const boardCommands = boards.map(board => ({
      id: `board-${board.id}`,
      label: board.name,
      description: board.description || 'Open board',
      group: 'Boards',
      keywords: ['board'],
      onSelect: () => onSelectBoard && onSelectBoard(board.id)
    }));

    const teamCommands = ['Manager', ...TEAMS].map(team => ({
      id: `team-${team}`,
      label: team === 'Manager' ? 'Manager (All)' : `Team ${team}`,
      description: 'Switch view context',
      group: 'Teams',
      keywords: ['team', 'view'],
      onSelect: () => setViewContext(team)
    }));

    return [...boardCommands, ...teamCommands];
  }, [boards, onSelectBoard, setViewContext]);

  return (
    <header className="flex-shrink-0 bg-[#161B22] border-b border-[#21262D] p-4 flex items-center justify-between z-20 relative">
      <CommandPalette
        open={isPaletteOpen}
        onOpenChange={setIsPaletteOpen}
        items={commandItems}
        placeholder="Search boards or teams"
      />

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div onClick={onGoToLanding} className="cursor-pointer flex items-center gap-2 group mr-4">
          <div className="w-8 h-8 bg-[#3FB950] rounded flex items-center justify-center text-[#0D1117] font-bold font-mono text-sm group-hover:scale-105 transition-transform">S</div>
          <span className="font-bold tracking-tight font-mono text-lg text-[#E6EDF3] hidden sm:block">syncSpace</span>
        </div>

        <div className="h-6 w-px bg-[#30363D] hidden sm:block"></div>

        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-[#8B949E] hover:text-[#E6EDF3] transition-colors group"
        >
          <div className="p-1.5 rounded-md hover:bg-[#21262D] transition-colors">
            <ArrowLeft size={18} />
          </div>
        </button>

        <h1 className="text-xl font-bold text-[#E6EDF3] truncate max-w-[200px]">{boardName}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* View Switcher */}
        <div className="hidden md:flex items-center p-1 bg-[#21262D] rounded-lg border border-[#30363D]">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${currentView === 'kanban' ? 'bg-[#0D1117] text-[#E6EDF3] shadow-sm' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}
          >
            <Layout size={14} />
            Board
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${currentView === 'calendar' ? 'bg-[#0D1117] text-[#E6EDF3] shadow-sm' : 'text-[#8B949E] hover:text-[#E6EDF3]'}`}
          >
            <CalendarIcon size={14} />
            Calendar
          </button>
        </div>

        <button
          onClick={() => setIsPaletteOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#21262D] border border-[#30363D] text-xs font-mono text-[#8B949E] hover:border-[#8B949E] transition-colors"
        >
          <Search size={14} />
          <span className="hidden xl:inline">Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#0D1117] text-[10px] font-bold text-[#8B949E]">Cmd+K</kbd>
        </button>

        {/* Presence & Context */}
        <div className="flex items-center gap-4 border-l border-[#30363D] pl-4 ml-2">

          {/* View Context Simulator */}
          <div className="hidden xl:flex items-center gap-2">
            <Users size={16} className="text-[#8B949E]" />
            <select
              value={viewContext}
              onChange={(e) => setViewContext(e.target.value)}
              className="bg-transparent text-sm font-medium text-[#E6EDF3] focus:outline-none cursor-pointer hover:text-[#3FB950] transition-colors"
            >
              <option value="Manager">Manager View</option>
              {TEAMS.map(team => (
                <option key={team} value={team}>Team {team}</option>
              ))}
            </select>
          </div>

          {activeEditors.length > 0 && (
            <div className="hidden sm:block">
              <PresenceIndicator editors={activeEditors} maxDisplay={3} compact />
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-[#8B949E] hover:text-[#E6EDF3] transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-[#F85149] text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotifOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                  <div className="p-3 border-b border-[#30363D] flex items-center justify-between bg-[#21262D]">
                    <h3 className="text-[#E6EDF3] font-bold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#58A6FF] hover:text-white"
                      >
                        Mark all read
                      </button>
                      <button 
                        onClick={handleClearAll}
                        className="text-xs text-[#F85149] hover:text-red-400"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#8B949E] text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id}
                            onClick={() => handleMarkAsRead(notif.id, notif.boardId, notif.taskId)}
                            className={`p-3 border-b border-[#30363D] last:border-0 cursor-pointer hover:bg-[#21262D] transition-colors flex gap-3 ${
                              !notif.read ? 'bg-[#0D1117] border-l-2 border-l-[#58A6FF]' : ''
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notif.type === 'COMMENT' ? (
                                <MessageSquare size={16} className="text-[#3FB950]" />
                              ) : (
                                <UserPlus size={16} className="text-[#58A6FF]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'text-[#E6EDF3] font-medium' : 'text-[#8B949E]'}`}>
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-[#8B949E]">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <ThemeToggle />
        </div>

        <button
          onClick={onNewTask}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-xl hover:bg-[#2EA043] transition-colors font-bold text-sm shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>

        <button onClick={onLogout} className="p-2 text-[#8B949E] hover:text-[#F85149] transition-colors" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
