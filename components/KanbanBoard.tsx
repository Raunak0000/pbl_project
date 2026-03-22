
import React, { useState, useMemo } from 'react';
import { Task, Status } from '../types';
import TaskCard from './TaskCard';
import { Columns, Filter, ChevronDown, ListFilter, ArrowUpDown, Tag, Plus } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    columns: Status[];
    onMoveTask: (taskId: string, newStatus: Status) => void;
    onTaskDrop: (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => void;
    onColumnDrop: (draggedColumn: Status, targetColumn: Status) => void;
    onSelectTask: (task: Task) => void;
    viewContext: string;
    blockedTaskId?: string | null;
}

const statusColors: { [key: string]: string } = {
    'To Do': 'bg-purple-400',
    'In Progress': 'bg-blue-400',
    'Done': 'bg-green-400',
    'Blocked': 'bg-red-400'
};

const statusBorderColors: { [key: string]: string } = {
    'To Do': 'border-purple-200',
    'In Progress': 'border-blue-200',
    'Done': 'border-green-200',
    'Blocked': 'border-red-200'
};

type FilterOption = 'all' | 'due_soon' | 'overdue' | 'no_date';
type SortOption = 'manual' | 'date_asc' | 'date_desc';

const KanbanColumn: React.FC<{
    status: Status;
    tasks: Task[];
    onTaskDrop: (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => void;
    onColumnDrop: (draggedColumn: Status, targetColumn: Status) => void;
    onSelectTask: (task: Task) => void;
    blockedTaskId?: string | null;
}> = ({ status, tasks, onTaskDrop, onColumnDrop, onSelectTask, blockedTaskId }) => {
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
            className={`
        flex-1 min-w-[320px] max-w-[360px] flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-200 transition-all duration-300
        ${isOver ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
      `}
        >
            {/* Column Header */}
            <div
                draggable
                onDragStart={handleColumnDragStart}
                onDrop={handleColumnDropHeader}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-between mb-4 px-2 py-2 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-gray-400'}`}></span>
                    <h2 className="text-sm font-semibold text-gray-700 select-none group-hover:text-gray-900 transition-colors">{status}</h2>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                    {tasks.length}
                </span>
            </div>

            <div className={`
        flex-1 overflow-y-auto px-1 space-y-3 pb-4 min-h-[150px] rounded-xl
        scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10
      `}>
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onSelectTask={onSelectTask}
                        onTaskDrop={(draggedId, targetId) => onTaskDrop(draggedId, status, targetId)}
                        isBlocked={blockedTaskId === task.id}
                    />
                ))}
                <button
                    onClick={() => onSelectTask({ id: '', title: '', description: '', status, tags: [], team: 'Unassigned' } as any)}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:text-blue-600 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
                >
                    <Plus size={16} />
                    Add task
                </button>
            </div>
        </div>
    );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, columns, onTaskDrop, onColumnDrop, onSelectTask, viewContext, blockedTaskId }) => {
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

        // 0. Filter by Team (View Context)
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
        <div className="flex flex-col h-full bg-cloud dark:bg-brand-dark overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 py-4 px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-brand-surface z-10 shadow-sm">

                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Columns size={16} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Board View</span>
                </div>

                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-2"></div>

                {viewContext !== 'Manager' && (
                    <div className="flex items-center px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-md text-xs font-bold border border-accent-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mr-2"></span>
                        {viewContext} Team
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative group">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterOption)}
                            className="pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <option value="all">All Tasks</option>
                            <option value="due_soon">Due Soon</option>
                            <option value="overdue">Overdue</option>
                            <option value="no_date">No Date</option>
                        </select>
                        <ListFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {availableTags.length > 0 && (
                        <div className="relative group">
                            <select
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <option value="all_tags">All Tags</option>
                                {availableTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    )}

                    <div className="relative group">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <option value="manual">Manual</option>
                            <option value="date_asc">Earliest</option>
                            <option value="date_desc">Latest</option>
                        </select>
                        <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {(filter !== 'all' || sort !== 'manual' || tagFilter !== 'all_tags') && (
                    <button
                        onClick={() => { setFilter('all'); setSort('manual'); setTagFilter('all_tags'); }}
                        className="text-xs font-medium text-slate-400 hover:text-accent-primary transition-colors ml-2"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Columns Container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 h-full p-6 min-w-fit">
                    {columns.map(status => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={processedTasks.filter(task => task.status === status)}
                            onTaskDrop={onTaskDrop}
                            onColumnDrop={onColumnDrop}
                            onSelectTask={onSelectTask}
                            blockedTaskId={blockedTaskId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;