
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
    'To Do': 'bg-[#A78BFA]',
    'In Progress': 'bg-[#58A6FF]',
    'Done': 'bg-[#3FB950]',
    'Blocked': 'bg-[#F85149]'
};

type FilterOption = 'all' | 'due_soon' | 'overdue' | 'no_date';
type SortOption = 'manual' | 'date_asc' | 'date_desc';

const KanbanColumn: React.FC<{
    status: Status;
    tasks: Task[];
    onTaskDrop: (draggedTaskId: string, newStatus: Status, targetTaskId: string | null) => void;
    onColumnDrop: (draggedColumn: Status, targetColumn: Status) => void;
    onSelectTask: (task: Task) => void;
    viewContext: string;
    blockedTaskId?: string | null;
}> = ({ status, tasks, onTaskDrop, onColumnDrop, onSelectTask, viewContext, blockedTaskId }) => {
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
        flex-1 min-w-[320px] max-w-[360px] flex flex-col transition-all duration-300
        ${isOver ? 'ring-2 ring-[#58A6FF] ring-offset-1 ring-offset-[#0D1117]' : ''}
      `}
        >
            {/* Column Header */}
            <div
                draggable
                onDragStart={handleColumnDragStart}
                onDrop={handleColumnDropHeader}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-between mb-4 px-2 py-2 cursor-grab active:cursor-grabbing hover:bg-[#21262D] rounded-lg transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-[#484F58]'}`}></span>
                    <h2 className="text-sm font-semibold text-[#E6EDF3] select-none">{status}</h2>
                </div>
                <span className="text-xs font-semibold text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded-full border border-[#30363D]">
                    {tasks.length}
                </span>
            </div>

            <div className={`
        flex-1 overflow-y-auto px-1 space-y-3 pb-4 min-h-[150px] rounded-xl
        scrollbar-thin scrollbar-thumb-[#30363D]
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
                    onClick={() => onSelectTask({ id: '', title: '', description: '', status, tags: [], team: viewContext === 'Manager' ? 'Unassigned' : viewContext } as any)}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#30363D] text-[#8B949E] text-sm font-medium hover:text-[#58A6FF] hover:border-[#58A6FF] hover:bg-[#21262D] transition-all"
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
        <div className="flex flex-col h-full bg-[#0D1117] overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 py-4 px-6 border-b border-[#21262D] bg-[#161B22] z-10">

                <div className="flex items-center gap-2 text-[#8B949E]">
                    <Columns size={16} />
                    <span className="text-sm font-semibold text-[#E6EDF3]">Board View</span>
                </div>

                <div className="w-px h-4 bg-[#30363D] mx-2"></div>

                {viewContext !== 'Manager' && (
                    <div className="flex items-center px-2 py-1 bg-[#0F3D20] text-[#3FB950] rounded-md text-xs font-bold border border-[#1A5C2E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] mr-2"></span>
                        {viewContext} Team
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative group">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterOption)}
                            className="pl-8 pr-8 py-1.5 bg-[#21262D] border border-[#30363D] text-[#C9D1D9] text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#3FB950] cursor-pointer hover:bg-[#30363D] transition-colors"
                        >
                            <option value="all">All Tasks</option>
                            <option value="due_soon">Due Soon</option>
                            <option value="overdue">Overdue</option>
                            <option value="no_date">No Date</option>
                        </select>
                        <ListFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                    </div>

                    {availableTags.length > 0 && (
                        <div className="relative group">
                            <select
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="pl-8 pr-8 py-1.5 bg-[#21262D] border border-[#30363D] text-[#C9D1D9] text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#3FB950] cursor-pointer hover:bg-[#30363D] transition-colors"
                            >
                                <option value="all_tags">All Tags</option>
                                {availableTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                        </div>
                    )}

                    <div className="relative group">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="pl-8 pr-8 py-1.5 bg-[#21262D] border border-[#30363D] text-[#C9D1D9] text-xs font-medium rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#3FB950] cursor-pointer hover:bg-[#30363D] transition-colors"
                        >
                            <option value="manual">Manual</option>
                            <option value="date_asc">Earliest</option>
                            <option value="date_desc">Latest</option>
                        </select>
                        <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
                    </div>
                </div>

                {(filter !== 'all' || sort !== 'manual' || tagFilter !== 'all_tags') && (
                    <button
                        onClick={() => { setFilter('all'); setSort('manual'); setTagFilter('all_tags'); }}
                        className="text-xs font-medium text-[#8B949E] hover:text-[#3FB950] transition-colors ml-2"
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
                            viewContext={viewContext}
                            blockedTaskId={blockedTaskId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;