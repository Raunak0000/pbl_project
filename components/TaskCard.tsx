
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import { Clock, CheckSquare, AlertCircle, User as UserIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onTaskDrop?: (draggedTaskId: string, targetTaskId: string) => void;
  isBlocked?: boolean;
}

// Helper: determine due-date badge state
const getDueDateState = (dueDate?: string): 'overdue' | 'due_soon' | 'upcoming' | null => {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
};

const dueDateColors: Record<string, string> = {
  overdue: 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]',
  due_soon: 'bg-[#3D2E0A] text-[#D29922] border-[#5C440F]',
  upcoming: 'bg-[#0F3D20] text-[#3FB950] border-[#1A5C2E]',
};

const priorityDotColors: Record<string, string> = {
  high: 'bg-[#F85149]',
  medium: 'bg-[#D29922]',
  low: 'bg-[#484F58]',
};

const statusBadgeColors: Record<string, string> = {
  'To Do': 'bg-[#2D1F63] text-[#A78BFA] border-[#4C3D7A]',
  'In Progress': 'bg-[#1E3A5F] text-[#58A6FF] border-[#2D5A8E]',
  'Done': 'bg-[#0F3D20] text-[#3FB950] border-[#1A5C2E]',
  'Blocked': 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onTaskDrop, isBlocked }) => {
  const [isOver, setIsOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { getTaskEditors } = useLiveEditing();

  const editors = getTaskEditors(task.id);
  const isDone = task.status === 'Done';
  const isInProgress = task.status === 'In Progress';
  const dueDateState = getDueDateState(task.dueDate);
  const priority = task.priority || 'low';

  // Shake animation for blocked moves
  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: [0, -4, 4, -4, 4, 0],
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, type: 'TASK' }));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const data = e.dataTransfer.getData('application/json');
    if (data && onTaskDrop) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'TASK' && parsed.id !== task.id) {
          onTaskDrop(parsed.id, task.id);
        }
      } catch (err) {
        console.error("Error parsing task drag data", err);
      }
    }
  };

  const getChecklistProgress = (html: string) => {
    if (!html) return null;

    const checkedAttr = html.match(/data-checked="true"/g) || [];
    const uncheckedAttr = html.match(/data-checked="false"/g) || [];
    const attrTotal = checkedAttr.length + uncheckedAttr.length;
    if (attrTotal > 0) {
      return {
        total: attrTotal,
        completed: checkedAttr.length,
        percent: Math.round((checkedAttr.length / attrTotal) * 100)
      };
    }

    const allChecks = html.match(/\[( |x|X)\]/g) || [];
    const completedChecks = html.match(/\[(x|X)\]/g) || [];
    if (allChecks.length === 0) return null;
    return {
      total: allChecks.length,
      completed: completedChecks.length,
      percent: Math.round((completedChecks.length / allChecks.length) * 100)
    };
  };

  const checklistProgress = getChecklistProgress(task.description);

  return (
    <motion.div
      animate={isBlocked ? 'shake' : 'idle'}
      variants={shakeVariants}
      className={`
        relative
        bg-[#161B22] rounded-xl p-4
        border border-[#30363D]
        hover:border-[#8B949E]
        cursor-pointer transition-all duration-200 ease-in-out
        ${isInProgress ? 'border-l-4 border-l-[#3FB950]' : ''}
        ${isDone ? 'opacity-50' : ''}
        ${isDragging ? 'scale-[1.02] shadow-xl ring-1 ring-[#58A6FF] opacity-80 rotate-1' : 'hover:scale-[1.01]'}
        ${isOver ? 'ring-2 ring-[#58A6FF] ring-offset-2 ring-offset-[#0D1117]' : ''}
        ${editors.length > 0 ? 'ring-1 ring-[#58A6FF]' : ''}
      `}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelectTask(task)}
        className="flex flex-col w-full relative"
      >
        {/* Priority dot — top-right */}
        <div className="absolute top-0 right-0">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${priorityDotColors[priority]}`} title={`Priority: ${priority}`} />
        </div>

        {/* Live editing indicator */}
        {editors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-[#58A6FF]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#58A6FF] animate-pulse" />
            <span>
              {editors.map(e => e.userName).join(', ')} editing...
            </span>
          </div>
        )}

        {/* Title + Team */}
        <div className="flex justify-between items-start gap-3 mb-2 pr-4">
          <h3 className={`font-semibold text-[#E6EDF3] text-sm leading-snug break-words w-full ${isDone ? 'line-through text-[#484F58]' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {task.blockedBy && task.blockedBy.length > 0 && (
              <div title="Blocked by dependency" className="flex items-center justify-center p-0.5 bg-[#3D0F0F] rounded">
                <AlertCircle className="w-3.5 h-3.5 text-[#F85149]" />
              </div>
            )}
            {task.team && task.team !== 'Unassigned' && (
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 bg-[#21262D] text-[#8B949E] rounded border border-[#30363D]">
                {task.team.substring(0, 3)}
              </span>
            )}
          </div>
        </div>

        {/* Status badge + Due date badge — always visible */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeColors[task.status] || 'bg-[#21262D] text-[#8B949E] border-[#30363D]'}`}>
            {task.status}
          </span>

          {task.dueDate && dueDateState && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${dueDateColors[dueDateState]}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Tags and Assignee */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[1.25rem]">
          {task.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#21262D] text-[#8B949E] border border-[#30363D]">
              {tag}
            </span>
          ))}

          {task.assignee && (
            <div className="ml-auto flex items-center">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1F3D20] border border-[#1A5C2E] flex items-center justify-center" title={task.assignee}>
                <span className="text-[10px] font-bold text-[#3FB950]">{task.assignee.substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {checklistProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1.5">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {Math.round(checklistProgress.percent)}%
              </span>
              <span>{checklistProgress.completed}/{checklistProgress.total}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[#21262D] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3FB950] transition-all duration-300"
                style={{ width: `${checklistProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard;
