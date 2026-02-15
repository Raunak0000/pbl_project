import React, { useEffect, useMemo, useState } from 'react';
import { Board, Task, TEAMS } from '../types';
import TaskEditor from './TaskEditor';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';
import CommandPalette, { CommandPaletteItem } from './CommandPalette';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Activity, CheckCircle2, Users, Trash2, Plus, Search, LayoutGrid, LogOut, Settings, Command } from 'lucide-react';

interface DashboardProps {
    boards: Board[];
    onAddBoard: (name: string, description: string) => void;
    onSelectBoard: (boardId: string) => void;
    onDeleteBoard: (boardId: string) => void;
    onGoToLanding: () => void;
    onUpdateTask: (boardId: string, taskId: string, updatedFields: Partial<Task>) => void;
    onLogout: () => void;
    onAdminClick: () => void;
}

// Team Progress Bar Component
const TeamProgressBar: React.FC<{
    teamName: string;
    completed: number;
    total: number;
    color: string;
}> = ({ teamName, completed, total, color }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-center font-mono text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{teamName}</span>
                <span className="text-slate-500 dark:text-slate-500">{completed}/{total}</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-brand-surface-light rounded-sm overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className={`h-full rounded-sm ${color} relative`}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20"></div>
                </motion.div>
            </div>
        </div>
    );
};

// Helper function to calculate team progress
const calculateTeamProgress = (boards: Board[], team: string) => {
    const allTasks = boards.flatMap(b => b.tasks.filter(t => t.team === team));
    const completed = allTasks.filter(t => t.status === 'Done').length;
    return { completed, total: allTasks.length };
};

// Calculate overall workload intensity
const calculateWorkloadIntensity = (boards: Board[]): { level: 'Green' | 'Yellow' | 'Red', label: string } => {
    const allTasks = boards.flatMap(b => b.tasks);
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const total = allTasks.length;

    if (total === 0) return { level: 'Green', label: 'IDLE' };

    const ratio = inProgress / total;
    if (ratio > 0.5) return { level: 'Red', label: 'CRITICAL' };
    if (ratio > 0.25) return { level: 'Yellow', label: 'HIGH' };
    return { level: 'Green', label: 'NOMINAL' };
};

// Generate vibe summary based on tasks
const generateVibeSummary = (boards: Board[]): string => {
    const allTasks = boards.flatMap(b => b.tasks);
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const overdue = allTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'Done';
    }).length;

    if (overdue > 5) return 'SYSTEM OVERLOAD: Multiple critical tasks pending.';
    if (inProgress > 10) return 'HIGH TRAFFIC: Development velocity at peak.';
    if (inProgress > 5) return 'STEADY FLOW: Operations proceeding normally.';
    return 'STANDBY: Awaiting new directives.';
};

const Dashboard: React.FC<DashboardProps> = ({
    boards,
    onAddBoard,
    onSelectBoard,
    onDeleteBoard,
    onGoToLanding,
    onUpdateTask,
    onLogout,
    onAdminClick
}) => {
    const { user, isAdmin } = useAuth();
    const { activeEditors } = useLiveEditing();
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // State for sidebar and page view
    const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set(boards.map(b => b.id)));
    const [activeTask, setActiveTask] = useState<{ boardId: string; taskId: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string>('All');
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // State for deletion confirmation
    const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

    const toggleBoardInSidebar = (boardId: string) => {
        setExpandedBoards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(boardId)) {
                newSet.delete(boardId);
            } else {
                newSet.add(boardId);
            }
            return newSet;
        });
    };

    const handleSelectTask = (boardId: string, taskId: string) => {
        setActiveTask({ boardId, taskId });
        setIsSidebarOpen(false);
    };

    const handleSelectDashboardHome = () => {
        setActiveTask(null);
        setIsSidebarOpen(false);
    };

    const handleAddBoard = () => {
        if (newBoardName.trim()) {
            onAddBoard(newBoardName.trim(), newBoardDescription.trim());
            setNewBoardName('');
            setNewBoardDescription('');
            setIsAdding(false);
        }
    };

    const handleConfirmDelete = () => {
        if (boardToDelete) {
            onDeleteBoard(boardToDelete.id);
            setBoardToDelete(null); // Close modal
        }
    };

    const activeBoard = activeTask ? boards.find(b => b.id === activeTask.boardId) : null;
    const activeTaskData = activeBoard ? activeBoard.tasks.find(t => t.id === activeTask.taskId) : null;

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
            keywords: ['board', 'project'],
            onSelect: () => onSelectBoard(board.id)
        }));

        const teamCommands = ['All', ...TEAMS].map(team => ({
            id: `team-${team}`,
            label: team === 'All' ? 'All Teams' : `Team ${team}`,
            description: 'Filter sidebar tasks',
            group: 'Teams',
            keywords: ['team', 'filter'],
            onSelect: () => setSelectedTeam(team)
        }));

        return [...boardCommands, ...teamCommands];
    }, [boards, onSelectBoard]);

    const resolveRole = (editor: { userId: string }) => {
        if (editor.userId === user?.id) {
            return user.role;
        }
        return 'USER';
    };

    const getFilteredTasks = (board: Board) => {
        if (selectedTeam === 'All') return board.tasks;
        return board.tasks.filter(task => task.team === selectedTeam);
    };

    return (
        <div className="flex h-screen bg-cloud dark:bg-brand-dark text-slate-900 dark:text-slate-100 font-sans selection:bg-accent-primary/30 selection:text-brand-dark">
            <CommandPalette
                open={isPaletteOpen}
                onOpenChange={setIsPaletteOpen}
                items={commandItems}
                placeholder="Search boards or teams"
            />
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" />}

            {/* Sidebar */}
            <aside className={`flex-shrink-0 bg-cloud-strong dark:bg-brand-surface border-r border-slate-200 dark:border-brand-border flex flex-col fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'w-16' : 'w-72'}`}>
                <div className="p-4 flex-shrink-0 flex items-center justify-between h-16 border-b border-slate-200 dark:border-brand-border">
                    {!isSidebarCollapsed && (
                        <div onClick={onGoToLanding} className="cursor-pointer flex items-center gap-2 group">
                            <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-brand-dark font-bold font-mono text-xs group-hover:scale-105 transition-transform">S</div>
                            <span className="font-bold tracking-tight font-mono text-sm">syncSpace_</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(prev => !prev)}
                        className={`p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isSidebarCollapsed ? <LayoutGrid size={18} /> : <div className="w-1 h-4 bg-slate-300 dark:bg-brand-border rounded-full"></div>}
                    </button>
                </div>

                {/* User Profile */}
                <div className="p-3 border-b border-slate-200 dark:border-brand-border bg-white/50 dark:bg-white/5">
                    <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="h-8 w-8 rounded bg-gradient-to-br from-slate-700 to-slate-900 dark:from-white dark:to-slate-400 flex items-center justify-center text-white dark:text-brand-dark font-bold font-mono text-xs shadow-sm">
                            {user?.username.substring(0, 2).toUpperCase()}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate">{user?.username}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{user?.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                    <button
                        onClick={handleSelectDashboardHome}
                        className={`w-full flex items-center gap-2 p-2 rounded-md transition-all ${!activeTask
                                ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-medium'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                        title="Dashboard"
                    >
                        <LayoutGrid size={18} />
                        {!isSidebarCollapsed && <span className="text-sm">Overview</span>}
                    </button>

                    <div className="py-2"></div>

                    {!isSidebarCollapsed && (
                        <div className="px-2 pb-2 flex items-center justify-between text-xs font-mono font-medium text-slate-400">
                            <span>PROJECTS</span>
                            <span className="opacity-50 text-[10px]">CMD+K</span>
                        </div>
                    )}


                    {boards.map(board => (
                        <div key={board.id}>
                            <button
                                onClick={() => toggleBoardInSidebar(board.id)}
                                className={`w-full flex items-center justify-between p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group ${isSidebarCollapsed ? 'justify-center' : ''}`}
                                title={board.name}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-xs font-mono opacity-50">#</span>
                                    {!isSidebarCollapsed && <span className="text-sm truncate">{board.name}</span>}
                                </div>
                            </button>

                            {expandedBoards.has(board.id) && !isSidebarCollapsed && (
                                <div className="ml-2 pl-2 border-l border-slate-200 dark:border-white/5 my-1 space-y-0.5">
                                    {getFilteredTasks(board).slice(0, 5).map(task => ( // Limit sidebar items
                                        <button
                                            key={task.id}
                                            onClick={() => handleSelectTask(board.id, task.id)}
                                            className={`w-full text-left p-1.5 text-xs rounded transition-colors truncate ${activeTask?.taskId === task.id
                                                    ? 'bg-accent-primary/10 text-accent-primary'
                                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            {task.title}
                                        </button>
                                    ))}
                                    {getFilteredTasks(board).length > 5 && (
                                        <button onClick={() => onSelectBoard(board.id)} className="w-full text-left p-1.5 text-[10px] text-slate-400 hover:text-accent-primary transition-colors">
                                            + {getFilteredTasks(board).length - 5} more...
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {!isSidebarCollapsed && (
                        <button
                            onClick={handleAddBoard} // Simplified add flow for now
                            className="w-full flex items-center gap-2 p-2 mt-4 text-xs font-medium text-slate-400 hover:text-accent-primary transition-colors border border-dashed border-slate-300 dark:border-white/10 rounded-md hover:border-accent-primary/50"
                        >
                            <Plus size={14} />
                            <span>Create Project</span>
                        </button>
                    )}
                </nav>

                <div className="p-3 border-t border-slate-200 dark:border-brand-border bg-slate-50 dark:bg-black/20">
                    <div className="flex flex-col gap-2">
                        {!isSidebarCollapsed && (
                            <div className="flex items-center justify-between">
                                <ThemeToggle />
                                {isAdmin && (
                                    <button onClick={onAdminClick} className="p-2 text-slate-500 hover:text-white transition-colors" title="Admin">
                                        <Settings size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className={`flex items-center gap-2 p-2 rounded-md text-status-error hover:bg-status-error/10 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            title="Logout"
                        >
                            <LogOut size={16} />
                            {!isSidebarCollapsed && <span className="text-xs font-bold">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-cloud dark:bg-brand-dark relative">
                {/* Mobile Header */}
                <header className="md:hidden flex-shrink-0 border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between bg-white dark:bg-brand-surface">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)}>
                            <LayoutGrid size={20} />
                        </button>
                        <span className="font-bold tracking-tight">Dashboard</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern bg-[size:30px_30px] opacity-[0.03] dark:opacity-[0.05]"></div>
                    </div>

                    <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
                        {activeTaskData && activeBoard ? (
                            <TaskEditor
                                task={activeTaskData}
                                boardName={activeBoard.name}
                                boardId={activeBoard.id}
                                onUpdateTask={onUpdateTask}
                            />
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accent-primary uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                                            System Overview
                                        </div>
                                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                                    </div>
                                    <button
                                        onClick={() => setIsPaletteOpen(true)}
                                        className="inline-flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
                                    >
                                        <Search size={16} />
                                        <span className="font-medium mr-4">Quick Search</span>
                                        <kbd className="hidden sm:inline-flex items-center gap-1 font-sans text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">
                                            <Command size={10} /> K
                                        </kbd>
                                    </button>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* Primary Stat Card */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="md:col-span-2 md:row-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6 shadow-sm relative overflow-hidden group hover:border-accent-primary/50 transition-colors"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Activity size={120} />
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-accent-primary" />
                                                        System Status
                                                    </h3>
                                                    {(() => {
                                                        const intensity = calculateWorkloadIntensity(boards);
                                                        const badgeColors = {
                                                            Green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                                                            Yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                                                            Red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                                        };
                                                        return (
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono border ${badgeColors[intensity.level]}`}>
                                                                {intensity.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                                    {generateVibeSummary(boards)}
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-8">
                                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                    <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">
                                                        {boards.flatMap(b => b.tasks).length}
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Total Modules</div>
                                                </div>
                                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                    <div className="text-3xl font-bold font-mono text-accent-primary mb-1">
                                                        {boards.flatMap(b => b.tasks).filter(t => t.status === 'Done').length}
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Shipped</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Team Progress Columns */}
                                    <div className="md:col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {['Engineering', 'Design', 'Marketing'].map((team, idx) => {
                                            const { completed, total } = calculateTeamProgress(boards, team);
                                            const colors = {
                                                Engineering: 'bg-blue-500',
                                                Design: 'bg-purple-500',
                                                Marketing: 'bg-pink-500'
                                            };

                                            return (
                                                <motion.div
                                                    key={team}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
                                                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-surface p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all"
                                                >
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white`}>
                                                            <Users size={16} />
                                                        </div>
                                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{team}</h3>
                                                    </div>

                                                    {total > 0 ? (
                                                        <TeamProgressBar
                                                            teamName="Sprint"
                                                            completed={completed}
                                                            total={total}
                                                            color={colors[team as keyof typeof colors]}
                                                        />
                                                    ) : (
                                                        <div className="h-12 flex items-center justify-center text-xs text-slate-400 font-mono border border-dashed border-slate-200 dark:border-white/10 rounded">
                                                            NO ACTIVE CYCLES
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <LayoutGrid size={16} />
                                        Active Projects
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {boards.map((board, idx) => (
                                            <motion.div
                                                key={board.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.1 * idx }}
                                                onClick={() => onSelectBoard(board.id)}
                                                className="group relative rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-surface p-5 cursor-pointer hover:border-slate-400 dark:hover:border-white/30 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex flex-col h-full justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-start justify-between">
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-accent-primary transition-colors line-clamp-1">{board.name}</h3>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setBoardToDelete(board); }}
                                                                    className="text-slate-400 hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 h-10">
                                                            {board.description || "No description provided."}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
                                                        <span className="flex items-center gap-1">
                                                            <div className={`w-2 h-2 rounded-full ${board.tasks.length > 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                                            {board.tasks.length > 0 ? 'ACTIVE' : 'EMPTY'}
                                                        </span>
                                                        <span className="ml-auto">
                                                            ID: {board.id.substring(0, 4)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsAdding(true)}
                                            className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:text-accent-primary hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all min-h-[160px]"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                                                <Plus size={20} />
                                            </div>
                                            <span className="font-medium text-sm">Initialize New Project</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Board Modal/Overlay (Simplified) */}
                {isAdding && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md bg-white dark:bg-brand-surface rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="text-accent-primary" /> New Project
                            </h2>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Project Designation"
                                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 mb-3 text-slate-900 dark:text-white focus:outline-none focus:border-accent-primary"
                                value={newBoardName}
                                onChange={e => setNewBoardName(e.target.value)}
                            />
                            <textarea
                                placeholder="Manifest / Description"
                                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 mb-6 h-24 text-slate-900 dark:text-white resize-none focus:outline-none focus:border-accent-primary"
                                value={newBoardDescription}
                                onChange={e => setNewBoardDescription(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddBoard}
                                    disabled={!newBoardName.trim()}
                                    className="px-6 py-2 rounded-lg bg-accent-primary text-brand-dark font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Initialize
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Deletion Modal */}
            {boardToDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-brand-surface rounded-xl shadow-2xl w-full max-w-md p-6 border border-status-error/30">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trash2 className="text-status-error" size={20} />
                            Terminate Project?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 my-4">
                            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{boardToDelete.name}</strong>? This action is irreversible and will purge all associated data modules.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setBoardToDelete(null)} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium">
                                Abort
                            </button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-status-error text-white rounded-lg hover:opacity-90 transition-opacity font-bold">
                                Confirm Termination
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;