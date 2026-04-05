
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
