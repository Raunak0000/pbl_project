import React, { useState, useEffect } from 'react';
import { Task, STATUSES, TEAMS } from '../types';
import TiptapEditor from './TiptapEditor';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';
import { Tag, Clock, Users, Link2, FileText, CheckCircle2, ChevronDown, Flag, User as UserIcon } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdate?: (taskId: string, updatedFields: Partial<Task>) => void;
}

const statusBadgeColors: Record<string, string> = {
  'To Do': 'bg-purple-50 text-purple-600 border-purple-200',
  'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
  'Done': 'bg-green-50 text-green-600 border-green-200',
  'Blocked': 'bg-red-50 text-red-600 border-red-200',
};

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
  overdue: 'bg-red-50 text-red-600 border-red-200',
  due_soon: 'bg-amber-50 text-amber-600 border-amber-200',
  upcoming: 'bg-green-50 text-green-600 border-green-200',
};

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, onDelete, onUpdate }) => {
  const { getTaskEditors, notifyEditing } = useLiveEditing();
  const editors = task ? getTaskEditors(task.id) : [];

  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'To Do',
    assignee: '',
    dueDate: '',
    tags: [],
    team: 'Unassigned',
    priority: 'medium',
  });
  const [newTag, setNewTag] = useState('');

  // When task prop changes, initialize state
  useEffect(() => {
    // Treat empty string ID as "new task" (passed from Kanban column "Add task" preset)
    const isEdit = task && task.id !== '';

    if (isEdit) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee: task.assignee || '',
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        team: task.team || 'Unassigned',
        priority: task.priority || 'medium',
      });
      notifyEditing('', task.id);
    } else {
      setFormData({
        title: '',
        description: '',
        status: task?.status || 'To Do', // Pre-fill status if provided by column drop
        assignee: '',
        dueDate: '',
        tags: [],
        team: 'Unassigned',
        priority: 'medium',
      });
      notifyEditing('', null);
    }
  }, [task?.id, task?.status]); // Re-run if ID changes or if status preset changes

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Instant update for sidebar fields if we're editing an existing task
    if (task && task.id !== '' && onUpdate && name !== 'title') {
      onUpdate(task.id, { [name]: value });
    }
  };

  const handleTitleBlur = () => {
    if (task && task.id !== '' && onUpdate) {
      if (formData.title !== task.title) {
        onUpdate(task.id, { title: formData.title });
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(newTag.trim())) {
        const updatedTags = [...(formData.tags || []), newTag.trim()];
        setFormData(prev => ({ ...prev, tags: updatedTags }));
        if (task && task.id !== '' && onUpdate) {
          onUpdate(task.id, { tags: updatedTags });
        }
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    setFormData(prev => ({ ...prev, tags: updatedTags }));
    if (task && task.id !== '' && onUpdate) {
      onUpdate(task.id, { tags: updatedTags });
    }
  };

  const handleSubmit = () => {
    if (!formData.title) return;
    onSave({
      id: task?.id || new Date().toISOString(),
      ...formData,
    });
  };

  // Debounced auto-save for description
  useEffect(() => {
    if (!task || task.id === '' || !onUpdate) {
      return;
    }
    if (formData.description === task.description) {
      return;
    }
    const handler = setTimeout(() => {
      onUpdate(task.id, { description: formData.description });
    }, 750);

    return () => clearTimeout(handler);
  }, [formData.description, task, onUpdate]);

  const dueDateState = getDueDateState(formData.dueDate);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden border border-gray-200">
        
        {/* Left Sidebar (Metadata) */}
        <aside className="w-full md:w-[260px] flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-5 flex items-center justify-between border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Project details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Status */}
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full appearance-none px-3 py-1.5 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${statusBadgeColors[formData.status] || 'bg-gray-100'}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flag size={14} /> Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full appearance-none pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                   <div className={`w-2 h-2 rounded-full ${formData.priority === 'high' ? 'bg-red-500' : formData.priority === 'medium' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                </div>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <UserIcon size={14} /> Assignee
              </label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                  <span className="text-[10px] font-bold text-blue-600">
                    {formData.assignee ? formData.assignee.substring(0, 2).toUpperCase() : '?'}
                  </span>
                </div>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  placeholder="Assign to..."
                  className="flex-1 bg-transparent border-none text-sm placeholder-gray-400 focus:outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={14} /> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${dueDateState ? dueDateColors[dueDateState] : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                `}
              />
            </div>

            {/* Team */}
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Users size={14} /> Team
              </label>
              <div className="relative">
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full appearance-none px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50"
                >
                  <option value="Unassigned">Unassigned</option>
                  {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={14} /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500 focus:outline-none">&times;</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag and press Enter..."
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </aside>

        {/* Right Main Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden p-6 md:p-8">
          
          <div className="flex items-center justify-between mb-6 shrink-0">
             <div className="flex items-center gap-2">
               {editors.length > 0 && <PresenceIndicator editors={editors} />}
               {editors.length > 0 && <span className="text-xs font-medium text-blue-500 animate-pulse">Live editing in progress...</span>}
             </div>
          </div>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleTitleBlur}
            placeholder="Write a task name"
            required
            className="w-full text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none focus:ring-0 mb-8 bg-transparent shrink-0"
          />

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 border border-gray-200 rounded-xl">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-600 shrink-0">
                <FileText size={16} /> Description
             </div>
             <div className="flex-1 overflow-y-auto bg-white p-4">
                <TiptapEditor
                    content={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="What is this task about?"
                    className="min-h-full"
                />
             </div>
          </div>

          {/* Footer Actions */}
          <footer className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div>
              {task && task.id !== '' && (
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  Delete task
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
               >
                  Cancel
               </button>
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.title.trim()}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
               >
                  {task && task.id !== '' ? 'Save changes' : 'Create Task'}
               </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default TaskModal;