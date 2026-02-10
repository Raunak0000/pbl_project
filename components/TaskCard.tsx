
import React, { useState } from 'react';
import { Task } from '../types';
import { useLiveEditing } from '../contexts/LiveEditingContext';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onTaskDrop?: (draggedTaskId: string, targetTaskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onTaskDrop }) => {
  const [isOver, setIsOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { getTaskEditors } = useLiveEditing();
  
  const editors = getTaskEditors(task.id);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, type: 'TASK' }));
    e.dataTransfer.effectAllowed = 'move';
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

  // Determine if there is any content to show on hover
  const hasExpandableContent = !!(task.description || task.dueDate);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelectTask(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-white dark:bg-[#21262D] rounded-lg p-3 shadow-sm hover:shadow-lg 
        cursor-pointer transform hover:scale-[1.02] transition-all duration-200 ease-in-out 
        border-l-4 border-slate-300 dark:border-[#30363D]
        ${isOver ? 'border-t-4 border-t-blue-500' : ''}
        ${editors.length > 0 ? 'ring-2 ring-green-400 dark:ring-green-500' : 'hover:border-l-blue-500 dark:hover:border-l-blue-400'}
      `}
    >
      <div className="flex flex-col w-full">
        {/* Live editing indicator */}
        {editors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">
              {editors.map(e => e.userName).join(', ')} editing...
            </span>
          </div>
        )}
        
        {/* Primary Info: Title and Team */}
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight pr-2 break-words w-full">
                {task.title}
            </h3>
            {task.team && task.team !== 'Unassigned' && (
                <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded self-start">
                    {task.team.substring(0,3)}
                </span>
            )}
        </div>
        
        {/* Secondary Info: Tags and Assignee (Always Visible) */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[1rem]">
            {task.tags?.map(tag => (
                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {tag}
                </span>
            ))}
            
            {task.assignee && (
                <div className="ml-auto flex items-center text-xs text-slate-400 dark:text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400" title={task.assignee}>
                        {task.assignee.substring(0, 2)}
                    </div>
                </div>
            )}
        </div>

        {/* Expandable Info: Description Snippet and Due Date (Visible on Hover) */}
        <div 
            className={`
                transition-all duration-300 ease-in-out overflow-hidden
                ${isHovered && hasExpandableContent ? 'max-h-40 opacity-100 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50' : 'max-h-0 opacity-0 mt-0'}
            `}
        >
            {task.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 break-words line-clamp-3 leading-relaxed">
                    {createSnippet(task.description)}
                </p>
            )}
            {task.dueDate && (
                <div className="flex items-center">
                    <div className={`
                        flex items-center text-[10px] font-medium px-2 py-1 rounded-full
                        ${new Date(task.dueDate) < new Date() ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                    `}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
