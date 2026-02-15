
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

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onTaskDrop, isBlocked }) => {
  const [isOver, setIsOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { getTaskEditors } = useLiveEditing();

  const editors = getTaskEditors(task.id);

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

  const createSnippet = (html: string) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>?/gm, ' ').trim();
    return text.length > 80 ? `${text.substring(0, 80)}...` : text;
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

  // Determine if there is any content to show on hover
  const hasExpandableContent = !!(task.description || task.dueDate);
  const checklistProgress = getChecklistProgress(task.description);

  return (
    <motion.div
      animate={isBlocked ? 'shake' : 'idle'}
      variants={shakeVariants}
      className={`
        relative group
        bg-white dark:bg-brand-surface rounded-lg p-3.5 
        border border-slate-200 dark:border-white/5
        shadow-sm hover:shadow-md dark:shadow-none
        hover:border-slate-300 dark:hover:border-white/20
        cursor-pointer transform transition-all duration-200 ease-in-out 
        ${isDragging ? 'scale-[1.02] shadow-xl ring-1 ring-accent-primary/50 opacity-80 rotate-1' : 'hover:scale-[1.01]'}
        ${isOver ? 'ring-2 ring-accent-secondary ring-offset-2 ring-offset-cloud dark:ring-offset-brand-dark' : ''}
        ${editors.length > 0 ? 'ring-1 ring-accent-primary' : ''}
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-accent-primary/0 group-hover:bg-accent-primary/[0.02] transition-colors pointer-events-none" />

      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelectTask(task)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col w-full relative z-10"
      >
        {/* Live editing indicator */}
        {editors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono font-bold text-accent-primary uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            <span>
              {editors.map(e => e.userName).join(', ')} editing...
            </span>
          </div>
        )}

        {/* Primary Info: Title and Team */}
        <div className="flex justify-between items-start gap-3 mb-2.5">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm leading-snug break-words w-full">
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {task.blockedBy && task.blockedBy.length > 0 && (
              <div title="Blocked by dependency" className="flex items-center justify-center p-0.5 bg-status-error/10 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-status-error" />
              </div>
            )}
            {task.team && task.team !== 'Unassigned' && (
              <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-white/5">
                {task.team.substring(0, 3)}
              </span>
            )}
          </div>
        </div>

        {/* Secondary Info: Tags and Assignee */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[1.25rem]">
          {task.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/5">
              {tag}
            </span>
          ))}

          {task.assignee && (
            <div className="ml-auto flex items-center">
              <div className="w-5 h-5 rounded overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center" title={task.assignee}>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{task.assignee.substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {checklistProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {Math.round(checklistProgress.percent)}%
              </span>
              <span>{checklistProgress.completed}/{checklistProgress.total}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-primary opacity-80 transition-all duration-300"
                style={{ width: `${checklistProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Expandable Info */}
        <div
          className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isHovered && hasExpandableContent ? 'max-h-40 opacity-100 mt-3 pt-3 border-t border-slate-100 dark:border-white/5' : 'max-h-0 opacity-0 mt-0'}
                `}
        >
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 break-words line-clamp-3 leading-relaxed font-sans">
              {createSnippet(task.description)}
            </p>
          )}
          {task.dueDate && (
            <div className="flex items-center">
              <div className={`
                            flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded
                            ${new Date(task.dueDate) < new Date()
                  ? 'bg-status-error/10 text-status-error border border-status-error/20'
                  : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'}
                        `}>
                <Clock className="w-3 h-3" />
                <span className="font-mono">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
