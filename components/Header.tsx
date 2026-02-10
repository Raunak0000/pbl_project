
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { TEAMS } from '../types';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';

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
    setViewContext
}) => {
    const { activeEditors, isConnected } = useLiveEditing();
    const commonButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#161B22]";
    const activeButtonClasses = "text-slate-900 dark:text-slate-100 font-semibold bg-slate-200 dark:bg-slate-700";
    const inactiveButtonClasses = "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
  
    return (
    <header className="flex-shrink-0 bg-slate-100 dark:bg-[#161B22] border-b border-slate-200 dark:border-[#30363D] p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
        <button onClick={onGoToLanding} className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900 dark:text-slate-100 flex-shrink-0">
            syncSpace
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-[#30363D] hidden sm:block"></div>
        <div className="flex items-center space-x-2 min-w-0">
            <button onClick={onGoBack} className="text-slate-500 hover:text-black dark:hover:text-white transition-colors p-1 rounded-full flex-shrink-0" aria-label="Go back to dashboard">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                 </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[150px] sm:max-w-xs">{boardName}</h1>
        </div>
        <nav className="hidden md:flex items-center rounded-lg p-1 space-x-1 ml-4">
          <button 
            onClick={() => setView('kanban')} 
            className={`${commonButtonClasses} ${currentView === 'kanban' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            Board
          </button>
          <button 
            onClick={() => setView('calendar')} 
            className={`${commonButtonClasses} ${currentView === 'calendar' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            Calendar
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        
        {/* Live Editing Status */}
        {activeEditors.length > 0 && (
          <div className="hidden sm:block">
            <PresenceIndicator editors={activeEditors} maxDisplay={3} />
          </div>
        )}
        
        {/* View Context Simulator */}
        <div className="hidden lg:flex items-center space-x-2 border-r border-slate-300 dark:border-slate-700 pr-4 mr-2">
             <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">View As:</span>
             <select 
                value={viewContext} 
                onChange={(e) => setViewContext(e.target.value)}
                className="bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#30363D] text-slate-700 dark:text-slate-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
                 <option value="Manager">Manager (All)</option>
                 {TEAMS.map(team => (
                     <option key={team} value={team}>Team {team}</option>
                 ))}
             </select>
        </div>

        <div className="flex md:hidden items-center rounded-lg p-1 space-x-1 bg-slate-200 dark:bg-[#21262D]">
          <button onClick={() => setView('kanban')} className={`p-1.5 rounded ${currentView === 'kanban' ? 'bg-white dark:bg-slate-700' : ''}`} aria-label="Board view">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>
          <button onClick={() => setView('calendar')} className={`p-1.5 rounded ${currentView === 'calendar' ? 'bg-white dark:bg-slate-700' : ''}`} aria-label="Calendar view">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
        </div>
        <ThemeToggle />
        <button 
            onClick={onNewTask}
            className="flex items-center space-x-2 p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#161B22]"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">New Task</span>
        </button>
        <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-500" title="Logout">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
             </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
