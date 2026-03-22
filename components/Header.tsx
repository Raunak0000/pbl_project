
import React, { useEffect, useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { Board, TEAMS } from '../types';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';
import CommandPalette, { CommandPaletteItem } from './CommandPalette';
import { ArrowLeft, Plus, Search, LogOut, Layout, Calendar as CalendarIcon, Users } from 'lucide-react';

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
    <header className="flex-shrink-0 bg-white dark:bg-brand-surface border-b border-slate-200 dark:border-white/5 p-4 flex items-center justify-between z-20 shadow-sm relative">
      <CommandPalette
        open={isPaletteOpen}
        onOpenChange={setIsPaletteOpen}
        items={commandItems}
        placeholder="Search boards or teams"
      />

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div onClick={onGoToLanding} className="cursor-pointer flex items-center gap-2 group mr-4">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-brand-dark font-bold font-mono text-sm group-hover:scale-105 transition-transform">S</div>
          <span className="font-bold tracking-tight font-mono text-lg hidden sm:block">syncSpace</span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </div>
        </button>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{boardName}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* View Switcher */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${currentView === 'kanban' ? 'bg-white dark:bg-brand-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            <Layout size={14} />
            Board
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${currentView === 'calendar' ? 'bg-white dark:bg-brand-surface text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            <CalendarIcon size={14} />
            Calendar
          </button>
        </div>

        <button
          onClick={() => setIsPaletteOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-white/20 transition-colors"
        >
          <Search size={14} />
          <span className="hidden xl:inline">Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold">Cmd+K</kbd>
        </button>

        {/* Presence & Context */}
        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-4 ml-2">

          {/* View Context Simulator */}
          <div className="hidden xl:flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <select
              value={viewContext}
              onChange={(e) => setViewContext(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer hover:text-accent-primary transition-colors"
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

          <ThemeToggle />
        </div>

        <button
          onClick={onNewTask}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-sm shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>

        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-status-error transition-colors" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
