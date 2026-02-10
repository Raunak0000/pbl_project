
import React, { useState } from 'react';
import { Board, Task } from '../types';
import TaskEditor from './TaskEditor';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

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
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    // State for sidebar and page view
    const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set(boards.map(b => b.id)));
    const [activeTask, setActiveTask] = useState<{ boardId: string; taskId: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-slate-100 font-sans">
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden" />}
            {/* Sidebar */}
            <aside className={`w-72 flex-shrink-0 bg-slate-100 dark:bg-[#161B22] border-r border-slate-200 dark:border-[#30363D] flex flex-col fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-[#30363D] flex-shrink-0 flex justify-between items-center">
                    <button onClick={onGoToLanding} className="text-2xl font-bold tracking-tighter focus:outline-none">
                        syncSpace
                    </button>
                    <ThemeToggle />
                </div>
                
                {/* User Profile Section in Sidebar */}
                <div className="p-4 border-b border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117]/50">
                    <div className="flex items-center mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.username.substring(0,2).toUpperCase()}
                        </div>
                        <div className="ml-2 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {isAdmin && (
                            <button onClick={onAdminClick} className="w-full text-left text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 py-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Admin Panel
                            </button>
                        )}
                        <button onClick={onLogout} className="w-full text-left text-xs font-medium text-red-500 hover:text-red-600 py-1 flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                             </svg>
                             Log Out
                        </button>
                    </div>
                </div>

                <nav className="flex-grow p-4 overflow-y-auto">
                    <button onClick={handleSelectDashboardHome} className={`w-full text-left font-semibold p-2 rounded-md transition-colors ${!activeTask ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200 dark:hover:bg-[#21262D]'}`}>
                        Dashboard Home
                    </button>
                    <div className="w-full h-px bg-slate-200 dark:bg-[#30363D] my-4"></div>
                    <div className="flex justify-between items-center px-2 mb-2">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</h3>
                    </div>
                    {boards.map(board => (
                        <div key={board.id} className="mb-2">
                            <button onClick={() => toggleBoardInSidebar(board.id)} className="w-full flex justify-between items-center text-left p-2 rounded-md hover:bg-slate-200 dark:hover:bg-[#21262D]">
                                <span className="font-medium">{board.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedBoards.has(board.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {expandedBoards.has(board.id) && (
                                <ul className="pl-4 mt-1 border-l border-slate-300 dark:border-slate-700">
                                    {board.tasks.length > 0 ? board.tasks.map(task => (
                                        <li key={task.id}>
                                            <button onClick={() => handleSelectTask(board.id, task.id)} className={`w-full text-left p-2 text-sm rounded-md transition-colors ${activeTask?.taskId === task.id ? 'bg-slate-200 dark:bg-[#21262D] font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#21262D]'}`}>
                                                {task.title}
                                            </button>
                                        </li>
                                    )) : <li className="px-2 pt-1 pb-2 text-xs text-slate-500">No tasks in this board.</li>}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                 <header className="md:hidden flex-shrink-0 bg-slate-100 dark:bg-[#161B22] border-b border-slate-200 dark:border-[#30363D] p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-1 mr-4" aria-label="Open menu">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                             </svg>
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                    </div>
                    <button onClick={onLogout} className="text-sm text-red-500 font-medium">Logout</button>
                </header>
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0D1117]">
                 {activeTaskData && activeBoard ? (
                    <TaskEditor 
                        task={activeTaskData}
                        boardName={activeBoard.name}
                        boardId={activeBoard.id}
                        onUpdateTask={onUpdateTask}
                    />
                ) : (
                    <div className="p-4 sm:p-8 space-y-8">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter">Dashboard</h1>
                                <h2 className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mt-2">
                                    Your Boards
                                </h2>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {boards.map(board => (
                                <div key={board.id} className="relative group min-h-[10rem] border border-slate-200 dark:border-[#30363D] rounded-lg flex flex-col justify-between hover:bg-slate-100 dark:hover:bg-[#161B22] transition-colors bg-white dark:bg-[#161B22] shadow-sm" title={board.description}>
                                    <div onClick={() => onSelectBoard(board.id)} className="p-6 cursor-pointer w-full h-full flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">{board.name}</h3>
                                            {board.description && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                                                    {board.description}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            {board.tasks.length} task{board.tasks.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setBoardToDelete(board); }} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete board">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            {/* Add Board Button */}
                            {isAdding ? (
                                <div className="min-h-[10rem] p-4 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg flex flex-col justify-center items-center bg-slate-50 dark:bg-[#161B22]/50">
                                <input 
                                    type="text"
                                    value={newBoardName}
                                    onChange={(e) => setNewBoardName(e.target.value)}
                                    placeholder="Board Name"
                                    autoFocus
                                    className="w-full bg-transparent text-lg font-bold placeholder-slate-500 focus:outline-none mb-2 text-center"
                                />
                                <textarea
                                    value={newBoardDescription}
                                    onChange={(e) => setNewBoardDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="w-full bg-transparent text-sm text-slate-600 dark:text-slate-400 placeholder-slate-400 focus:outline-none resize-none text-center mb-4 h-16"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleAddBoard} className="text-sm font-semibold px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add</button>
                                    <button onClick={() => setIsAdding(false)} className="text-sm px-3 py-1 hover:bg-slate-200 dark:hover:bg-[#21262D] rounded-md">Cancel</button>
                                </div>
                                </div>
                            ) : (
                                <div onClick={() => setIsAdding(true)} className="min-h-[10rem] p-6 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-slate-900 dark:hover:border-slate-200 transition-colors">
                                    <div className="text-center text-slate-500 dark:text-slate-400">
                                        <span className="text-4xl">+</span>
                                        <p className="font-semibold mt-2">Add New Board</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </main>
            </div>

            {/* Deletion Confirmation Modal */}
            {boardToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-[#161B22] rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                        <h3 className="text-xl font-bold">Delete '{boardToDelete.name}'?</h3>
                        <p className="text-slate-600 dark:text-slate-400 my-4">This will permanently delete the board and all its tasks. This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setBoardToDelete(null)} className="px-4 py-2 bg-slate-200 dark:bg-[#30363D] text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-[#414850] focus:outline-none">
                                Cancel
                            </button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;