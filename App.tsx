import { api } from './services/api';
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
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const fetchedBoards = await api.getBoards();
        const boardsWithTasks = await Promise.all(fetchedBoards.map(async (board) => {
          try {
            const tasks = await api.getTasksForBoard(board.id);
            return {
              ...board,
              columns: board.columns || [...STATUSES],
              tasks: tasks.map(t => ({
                ...t,
                tags: t.tags || [],
                team: t.team || 'Unassigned'
              }))
            };
          } catch (err) {
            console.error('Failed to fetch tasks for board ' + board.id, err);
            return { ...board, tasks: [], columns: board.columns || [...STATUSES] };
          }
        }));
        setBoards(boardsWithTasks);
      } catch (error) {
        console.error("Could not fetch boards from API", error);
      }
    };
    if (isAuthenticated) {
      fetchBoards();
    }
  }, [isAuthenticated]);

  const [appView, setAppView] = useState<AppView>('landing');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Board-specific State
  const [boardView, setBoardView] = useState<BoardView>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [blockedTaskId, setBlockedTaskId] = useState<string | null>(null);
  const [blockingTaskNames, setBlockingTaskNames] = useState<string[]>([]);

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
      } else if (event.type === 'BOARD_DELETE') {
        const { boardId } = event.payload;
        setBoards(prevBoards => prevBoards.filter(b => b.id !== boardId));
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

  // Dependency Validation Helper
  const canMoveTaskToDone = (taskId: string, board: Board): { canMove: boolean; blockingNames: string[] } => {
    const task = board.tasks.find(t => t.id === taskId);
    if (!task || !task.blockedBy || task.blockedBy.length === 0) {
      return { canMove: true, blockingNames: [] };
    }

    // Check if any blocking task is NOT in Done status
    const blockingNames: string[] = [];
    const isBlocked = task.blockedBy.some(blockerId => {
      const blockingTask = board.tasks.find(t => t.id === blockerId);
      if (blockingTask && blockingTask.status !== 'Done') {
        blockingNames.push(blockingTask.title);
        return true;
      }
      return false;
    });

    return { canMove: !isBlocked, blockingNames };
  };

  // Board Management
  const handleAddBoard = async (name: string, description: string) => {
    try {
      const createdBoard = await api.createBoard({
        name,
        description,
        tasks: [],
        columns: [...STATUSES],
      });
      setBoards(prev => [...prev, { ...createdBoard, tasks: [], columns: createdBoard.columns || [...STATUSES] }]);
    } catch {
      console.error("Failed to add board");
    }
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setAppView('board');
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await api.deleteBoard(boardId);
      setBoards(prev => prev.filter(b => b.id !== boardId));
      
      // Broadcast deletion
      liveEditingService.broadcastBoardDelete(boardId);
      
      if (activeBoardId === boardId) {
        setActiveBoardId(null);
        setAppView('dashboard');
      }
    } catch {
      console.error("Failed to delete board");
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

  const handleSaveTask = async (taskToSave: Task) => {
    if (!activeBoardId) return;

    const isNewTask = !boards.find(b => b.id === activeBoardId)?.tasks.find(t => t.id === taskToSave.id);

    try {
      let savedTask: Task;
      if (isNewTask) {
        savedTask = await api.createTask({ ...taskToSave, boardId: activeBoardId });
      } else {
        savedTask = await api.updateTask(taskToSave.id, taskToSave);
      }

      setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;

        const taskExists = board.tasks.find(t => t.id === savedTask.id);
        const newTasks = taskExists
          ? board.tasks.map(t => t.id === savedTask.id ? savedTask : t)
          : [...board.tasks, savedTask];

        return { ...board, tasks: newTasks };
      }));

      // Broadcast the change
      if (isNewTask) {
        liveEditingService.broadcastTaskCreate(activeBoardId, savedTask);
      } else {
        liveEditingService.broadcastTaskUpdate(activeBoardId, savedTask.id, savedTask);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save task", error);
      alert("Failed to save task. Please check the connection and try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!activeBoardId) return;
    try {
      await api.deleteTask(taskId);
      setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;
        return { ...board, tasks: board.tasks.filter(t => t.id !== taskId) };
      }));

      // Broadcast deletion
      liveEditingService.broadcastTaskDelete(activeBoardId, taskId);

      handleCloseModal();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleMoveTask = useCallback(async (taskId: string, newStatus: Status) => {
    if (!activeBoardId) return;
    // Validate dependencies if moving to 'Done' status
    if (newStatus === 'Done') {
      const activeBoard = boards.find(b => b.id === activeBoardId);
      if (activeBoard) {
        const { canMove, blockingNames } = canMoveTaskToDone(taskId, activeBoard);
        if (!canMove) {
          setBlockedTaskId(taskId);
          setBlockingTaskNames(blockingNames);
          alert(`Cannot move task to Done.\n\nBlocked by:\n${blockingNames.map(name => `• ${name}`).join('\n')}`);

          setTimeout(() => {
            setBlockedTaskId(null);
            setBlockingTaskNames([]);
          }, 600);
          return;
        }
      }
    }

    try {
      await api.updateTaskStatus(taskId, newStatus);
      setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== activeBoardId) return board;
        const newTasks = board.tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        return { ...board, tasks: newTasks };
      }));

      // Broadcast status change
      liveEditingService.broadcastTaskUpdate(activeBoardId, taskId, { status: newStatus });
    } catch (error) {
      console.error("Failed to move task", error);
    }
  }, [activeBoardId, boards]);

  // Reorder Logic
  const handleTaskDrop = async (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => {
    if (!activeBoardId) return;

    const activeBoard = boards.find(b => b.id === activeBoardId);
    if (!activeBoard) return;

    // Validate dependencies if moving to 'Done' status
    if (newStatus === 'Done') {
      const { canMove, blockingNames } = canMoveTaskToDone(draggedTaskId, activeBoard);
      if (!canMove) {
        // Show notification and trigger shake animation
        setBlockedTaskId(draggedTaskId);
        setBlockingTaskNames(blockingNames);
        alert(`Cannot move task to Done.\n\nBlocked by:\n${blockingNames.map(name => `• ${name}`).join('\n')}`);

        // Clear the blocked state after animation completes
        setTimeout(() => {
          setBlockedTaskId(null);
          setBlockingTaskNames([]);
        }, 600);
        return;
      }
    }

    try {
      await api.updateTaskStatus(draggedTaskId, newStatus);

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
    } catch (error) {
      console.error("Failed to drop task", error);
    }
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

  const handleUpdateTask = useCallback(async (boardId: string, taskId: string, updatedFields: Partial<Task>) => {
    try {
      await api.updateTask(taskId, updatedFields);
      setBoards(prevBoards => prevBoards.map(board => {
        if (board.id !== boardId) return board;

        const newTasks = board.tasks.map(task =>
          task.id === taskId ? { ...task, ...updatedFields } : task
        );
        return { ...board, tasks: newTasks };
      }));

      // Broadcast task update
      liveEditingService.broadcastTaskUpdate(boardId, taskId, updatedFields);
    } catch (error) {
      console.error("Failed to update task", error);
    }
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
      <div className="flex flex-col h-screen font-sans bg-cloud dark:bg-brand-dark text-slate-900 dark:text-slate-100">
        <Header
          boardName={activeBoard.name}
          currentView={boardView}
          setView={setBoardView}
          onNewTask={() => handleOpenModal({ id: '', title: '', description: '', status: 'To Do', tags: [], team: viewContext === 'Manager' ? 'Unassigned' : viewContext } as any)}
          onGoBack={handleGoToDashboard}
          onGoToLanding={handleGoToLanding}
          onLogout={handleLogout}
          viewContext={viewContext}
          setViewContext={setViewContext}
          boards={boards}
          onSelectBoard={handleSelectBoard}
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
              blockedTaskId={blockedTaskId}
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
