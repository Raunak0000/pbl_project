
import React, { useState, useMemo } from 'react';
import { Task, Status } from '../types';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  columns: Status[];
  onMoveTask: (taskId: string, newStatus: Status) => void;
  onTaskDrop: (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => void;
  onColumnDrop: (draggedColumn: Status, targetColumn: Status) => void;
  onSelectTask: (task: Task) => void;
  viewContext: string;
}

const statusColors: { [key: string]: string } = {
  'To Do': 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  'Done': 'bg-green-500',
};

type FilterOption = 'all' | 'due_soon' | 'overdue' | 'no_date';
type SortOption = 'manual' | 'date_asc' | 'date_desc';

const KanbanColumn: React.FC<{
  status: Status;
  tasks: Task[];
  onTaskDrop: (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => void;
  onColumnDrop: (draggedColumn: Status, targetColumn: Status) => void;
  onSelectTask: (task: Task) => void;
}> = ({ status, tasks, onTaskDrop, onColumnDrop, onSelectTask }) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    e.stopPropagation();

    const taskData = e.dataTransfer.getData('application/json');
    const columnData = e.dataTransfer.getData('columnId');

    if (taskData) {
        try {
            const { id: draggedTaskId, type } = JSON.parse(taskData);
            if (type === 'TASK') {
                onTaskDrop(draggedTaskId, status, null);
            }
        } catch (e) {
            console.error("Failed to parse drop data", e);
        }
    } else if (columnData) {
        onColumnDrop(columnData as Status, status);
    }
  };

  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('columnId', status);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDropHeader = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const columnData = e.dataTransfer.getData('columnId');
      if (columnData && columnData !== status) {
          onColumnDrop(columnData as Status, status);
      }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[300px] bg-slate-100 dark:bg-[#161B22] rounded-lg p-4 transition-all duration-300 flex flex-col ${isOver ? 'bg-slate-200 dark:bg-[#21262D]' : ''}`}
    >
      {/* Column Header - Draggable Handle */}
      <div 
        draggable 
        onDragStart={handleColumnDragStart}
        onDrop={handleColumnDropHeader}
        onDragOver={(e) => e.preventDefault()}
        className="flex items-center mb-4 cursor-grab active:cursor-grabbing p-2 -ml-2 -mt-2 rounded hover:bg-slate-200 dark:hover:bg-[#30363D]"
      >
        <span className={`w-3 h-3 rounded-full mr-2 ${statusColors[status] || 'bg-slate-500'}`}></span>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 select-none">{status}</h2>
        <span className="ml-2 bg-slate-200 dark:bg-[#21262D] text-slate-600 dark:text-slate-400 text-sm font-bold px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onSelectTask={onSelectTask} 
            onTaskDrop={(draggedId, targetId) => onTaskDrop(draggedId, status, targetId)}
          />
        ))}
        {tasks.length === 0 && (
             <div className="h-24 border-2 border-dashed border-slate-200 dark:border-[#30363D] rounded-lg flex items-center justify-center text-slate-400 text-sm">
                Drop tasks here
            </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, columns, onTaskDrop, onColumnDrop, onSelectTask, viewContext }) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [tagFilter, setTagFilter] = useState<string>('all_tags');
  const [sort, setSort] = useState<SortOption>('manual');

  // Extract all unique tags from tasks
  const availableTags = useMemo(() => {
      const tags = new Set<string>();
      tasks.forEach(task => {
          if (task.tags) {
              task.tags.forEach(tag => tags.add(tag));
          }
      });
      return Array.from(tags).sort();
  }, [tasks]);

  const processedTasks = useMemo(() => {
    let result = [...tasks];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 0. Filter by Team (View Context) - Strictly enforced "Role Based" view
    if (viewContext && viewContext !== 'Manager') {
        result = result.filter(task => task.team === viewContext);
    }

    // 1. Filter by Tag
    if (tagFilter !== 'all_tags') {
        result = result.filter(task => task.tags?.includes(tagFilter));
    }

    // 2. Filter by Date
    if (filter !== 'all') {
        result = result.filter(task => {
            if (filter === 'no_date') return !task.dueDate;
            
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);

            if (filter === 'overdue') {
                return taskDate < today;
            }
            if (filter === 'due_soon') {
                // Due within next 7 days (including today)
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                return taskDate >= today && taskDate <= nextWeek;
            }
            return true;
        });
    }

    // 3. Sort
    if (sort !== 'manual') {
        result.sort((a, b) => {
            // Always put tasks without due dates at the bottom when sorting by date
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            if (sort === 'date_asc') {
                return a.dueDate.localeCompare(b.dueDate);
            } else {
                return b.dueDate.localeCompare(a.dueDate);
            }
        });
    }

    return result;
  }, [tasks, filter, sort, tagFilter, viewContext]);

  return (
    <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-4 px-2 flex-shrink-0">
            
            {/* Visual Indicator of current View Role */}
            {viewContext !== 'Manager' && (
                 <div className="flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold border border-blue-200 dark:border-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    {viewContext} Team View
                 </div>
            )}

            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter:</label>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value as FilterOption)}
                    className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-slate-700 dark:text-slate-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Tasks</option>
                    <option value="due_soon">Due Soon (7 days)</option>
                    <option value="overdue">Overdue</option>
                    <option value="no_date">No Due Date</option>
                </select>
            </div>

            {availableTags.length > 0 && (
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Tags:</label>
                    <select 
                        value={tagFilter} 
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-slate-700 dark:text-slate-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all_tags">All Tags</option>
                        {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort:</label>
                <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-slate-700 dark:text-slate-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="manual">Manual Order</option>
                    <option value="date_asc">Due Date (Earliest)</option>
                    <option value="date_desc">Due Date (Latest)</option>
                </select>
            </div>
            
            {(filter !== 'all' || sort !== 'manual' || tagFilter !== 'all_tags') && (
                <button 
                    onClick={() => { setFilter('all'); setSort('manual'); setTagFilter('all_tags'); }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Reset View
                </button>
            )}
        </div>

        {/* Columns Container */}
        <div className="flex gap-6 h-full overflow-x-auto p-2 pb-4">
            {columns.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={processedTasks.filter(task => task.status === status)}
                    onTaskDrop={onTaskDrop}
                    onColumnDrop={onColumnDrop}
                    onSelectTask={onSelectTask}
                />
            ))}
        </div>
    </div>
  );
};

export default KanbanBoard;