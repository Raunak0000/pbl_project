
import React, { useState, useEffect, useCallback } from 'react';
import { Task, Status, Board, STATUSES } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import TaskModal from './components/TaskModal';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import AdminDashboard from './components/admin/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { liveEditingService, LiveEditingEvent } from './services/liveEditingService';

type AppView = 'landing' | 'login' | 'register' | 'dashboard' | 'board' | 'admin';
type BoardView = 'kanban' | 'calendar';

const App: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  
  // Main State
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
        const savedBoards = localStorage.getItem('syncSpaceBoards');
        const parsedBoards = savedBoards ? JSON.parse(savedBoards) : [];
        // Migration: Ensure all boards have columns property and tasks have tags/teams
        return parsedBoards.map((b: any) => ({
            ...b,
            columns: b.columns || [...STATUSES],
            tasks: b.tasks.map((t: any) => ({
                ...t,
                tags: t.tags || [],
                team: t.team || 'Unassigned'
            }))
        }));
    } catch (error) {
        console.error("Could not parse boards from localStorage", error);
        return [];
    }
  });

  const [appView, setAppView] = useState<AppView>('landing');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  
  // Board-specific State
  const [boardView, setBoardView] = useState<BoardView>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // View Context (Simulation of Role/Team Login)
  // 'Manager' sees all. Specific Team names see only their tasks.
  const [viewContext, setViewContext] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          return params.get('team') || 'Manager';
      }
      return 'Manager';
  });

  // Sync URL with View Context
  useEffect(() => {
      const url = new URL(window.location.href);
      if (viewContext === 'Manager') {
          url.searchParams.delete('team');
      } else {
          url.searchParams.set('team', viewContext);
      }
      window.history.pushState({}, '', url);
  }, [viewContext]);

  useEffect(() => {
    localStorage.setItem('syncSpaceBoards', JSON.stringify(boards));
  }, [boards]);

  // Live Editing Integration
  useEffect(() => {
    const unsubscribe = liveEditingService.subscribe('app', (event: LiveEditingEvent) => {
      // Skip our own events for TASK operations to avoid double processing
      if ('userId' in event.payload && event.payload.userId === user?.id) {
        // Still update presence info
        if (event.type === 'USER_EDITING' || event.type === 'USER_LEFT') {
          // This will trigger a re-render to show presence
          return;
        }
        // Skip our own task updates
        return;
      }
      
      if (event.type === 'TASK_UPDATE') {
        const { boardId, taskId, updates } = event.payload;
        setBoards(prevBoards => prevBoards.map(board => {
          if (board.id !== boardId) return board;
          return {
            ...board,
            tasks: board.tasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          };
        }));
      } else if (event.type === 'TASK_CREATE') {
        const { boardId, task } = event.payload;
        setBoards(prevBoards => prevBoards.map(board => {
          if (board.id !== boardId) return board;
          if (board.tasks.find(t => t.id === task.id)) return board; // Already exists
          return { ...board, tasks: [...board.tasks, task] };
        }));
      } else if (event.type === 'TASK_DELETE') {
        const { boardId, taskId } = event.payload;
        setBoards(prevBoards => prevBoards.map(board => {
          if (board.id !== boardId) return board;
          return { ...board, tasks: board.tasks.filter(t => t.id !== taskId) };
        }));
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Auth & Navigation Effects
  useEffect(() => {
      // Redirect to dashboard if logged in and on landing/auth pages
      if (isAuthenticated && (appView === 'landing' || appView === 'login' || appView === 'register')) {
          setAppView('dashboard');
      }
  }, [isAuthenticated]);

  const handleLogout = () => {
      logout();
      setAppView('landing');
  };

  const handleGoToDashboard = () => {
      setActiveBoardId(null);
      setAppView('dashboard');
  }

  const handleGoToLanding = () => {
      setActiveBoardId(null);
      setAppView('landing');
  }

  // Board Management
  const handleAddBoard = (name: string, description: string) => {
    const newBoard: Board = {
      id: new Date().toISOString(),
      name,
      description,
      tasks: [],
      columns: [...STATUSES],
    };
    setBoards(prev => [...prev, newBoard]);
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setAppView('board');
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards(prev => prev.filter(b => b.id !== boardId));
    if (activeBoardId === boardId) {
        setActiveBoardId(null);
        setAppView('dashboard');
    }
  };

  // Task Management (within the active board)
  const handleOpenModal = (task: Task | null) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (taskToSave: Task) => {
    if (!activeBoardId) return;
    
    const isNewTask = !boards.find(b => b.id === activeBoardId)?.tasks.find(t => t.id === taskToSave.id);
    
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;

        const taskExists = board.tasks.find(t => t.id === taskToSave.id);
        const newTasks = taskExists
            ? board.tasks.map(t => t.id === taskToSave.id ? taskToSave : t)
            : [...board.tasks, taskToSave];
        
        return { ...board, tasks: newTasks };
    }));
    
    // Broadcast the change
    if (isNewTask) {
      liveEditingService.broadcastTaskCreate(activeBoardId, taskToSave);
    } else {
      liveEditingService.broadcastTaskUpdate(activeBoardId, taskToSave.id, taskToSave);
    }
    
    handleCloseModal();
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (!activeBoardId) return;
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;
        return { ...board, tasks: board.tasks.filter(t => t.id !== taskId) };
    }));
    
    // Broadcast deletion
    liveEditingService.broadcastTaskDelete(activeBoardId, taskId);
    
    handleCloseModal();
  };

  const handleMoveTask = useCallback((taskId: string, newStatus: Status) => {
    if (!activeBoardId) return;
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;
        const newTasks = board.tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        );
        return { ...board, tasks: newTasks };
    }));
    
    // Broadcast status change
    liveEditingService.broadcastTaskUpdate(activeBoardId, taskId, { status: newStatus });
  }, [activeBoardId]);

  // Reorder Logic
  const handleTaskDrop = (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => {
    if (!activeBoardId) return;
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;

        const taskToMove = board.tasks.find(t => t.id === draggedTaskId);
        if (!taskToMove) return board;

        // Remove the task from the list
        let newTasks = board.tasks.filter(t => t.id !== draggedTaskId);
        
        // Update the task's status
        const updatedTask = { ...taskToMove, status: newStatus };

        if (targetTaskId) {
             const targetIndex = newTasks.findIndex(t => t.id === targetTaskId);
             if (targetIndex !== -1) {
                 newTasks.splice(targetIndex, 0, updatedTask);
             } else {
                 newTasks.push(updatedTask);
             }
        } else {
            newTasks.push(updatedTask);
        }

        return { ...board, tasks: newTasks };
    }));
  };

  const handleColumnDrop = (draggedColumn: Status, targetColumn: Status) => {
    if (!activeBoardId) return;
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;
        
        const columns = [...(board.columns || STATUSES)];
        const fromIdx = columns.indexOf(draggedColumn);
        const toIdx = columns.indexOf(targetColumn);

        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return board;

        columns.splice(fromIdx, 1);
        columns.splice(toIdx, 0, draggedColumn);

        return { ...board, columns };
    }));
  };

  const handleUpdateTask = useCallback((boardId: string, taskId: string, updatedFields: Partial<Task>) => {
    setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== boardId) return board;

        const newTasks = board.tasks.map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
        );
        return { ...board, tasks: newTasks };
    }));
    
    // Broadcast task update
    liveEditingService.broadcastTaskUpdate(boardId, taskId, updatedFields);
  }, []);

  const handleUpdateTaskInModal = useCallback((taskId: string, updatedFields: Partial<Task>) => {
    if (!activeBoardId) return;
    handleUpdateTask(activeBoardId, taskId, updatedFields);
    setSelectedTask(prev => prev ? { ...prev, ...updatedFields } : null);
  }, [activeBoardId, handleUpdateTask]);

  // Render Logic

  if (appView === 'landing') {
    return <LandingPage 
        onEnter={() => setAppView('dashboard')} 
        onLogin={() => setAppView('login')}
        onRegister={() => setAppView('register')}
    />;
  }

  if (appView === 'login') {
      return <LoginPage 
        onRegisterClick={() => setAppView('register')}
        onSuccess={() => setAppView('dashboard')}
        onCancel={() => setAppView('landing')}
      />
  }

  if (appView === 'register') {
      return <RegisterPage 
        onLoginClick={() => setAppView('login')}
        onSuccess={() => setAppView('dashboard')}
        onCancel={() => setAppView('landing')}
      />
  }

  if (!isAuthenticated) {
      setAppView('landing');
      return null;
  }

  if (appView === 'admin') {
      if (!isAdmin) {
          setAppView('dashboard');
          return null;
      }
      return <AdminDashboard onGoHome={() => setAppView('dashboard')} />
  }

  if (appView === 'dashboard') {
    return <Dashboard 
        boards={boards} 
        onAddBoard={handleAddBoard} 
        onSelectBoard={handleSelectBoard} 
        onDeleteBoard={handleDeleteBoard} 
        onGoToLanding={handleGoToLanding} 
        onUpdateTask={handleUpdateTask}
        onLogout={handleLogout}
        onAdminClick={() => setAppView('admin')}
    />;
  }
  
  if (appView === 'board' && activeBoardId) {
    const activeBoard = boards.find(b => b.id === activeBoardId);
    
    if (!activeBoard) {
        handleGoToDashboard();
        return null;
    }

    return (
        <div className="flex flex-col h-screen font-sans bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-slate-100">
            <Header
                boardName={activeBoard.name}
                currentView={boardView}
                setView={setBoardView}
                onNewTask={() => handleOpenModal(null)}
                onGoBack={handleGoToDashboard}
                onGoToLanding={handleGoToLanding}
                onLogout={handleLogout}
                viewContext={viewContext}
                setViewContext={setViewContext}
            />
            <main className="flex-grow p-4 md:p-6 overflow-auto">
            {boardView === 'kanban' && (
                <KanbanBoard
                    tasks={activeBoard.tasks}
                    columns={activeBoard.columns || STATUSES}
                    onMoveTask={handleMoveTask}
                    onTaskDrop={handleTaskDrop}
                    onColumnDrop={handleColumnDrop}
                    onSelectTask={(task) => handleOpenModal(task)}
                    viewContext={viewContext}
                />
            )}
            {boardView === 'calendar' && 
                <CalendarView 
                    tasks={activeBoard.tasks} 
                    onSelectTask={(task) => handleOpenModal(task)}
                />
            }
            </main>
            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTaskInModal}
                />
            )}
        </div>
    );
  }

  return <LandingPage onEnter={() => setAppView('dashboard')} onLogin={() => setAppView('login')} onRegister={() => setAppView('register')} />;
};

export default App;
