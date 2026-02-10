
import React, { useState, useEffect } from 'react';
import { Task, STATUSES, TEAMS } from '../types';
import TiptapEditor from './TiptapEditor';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdate?: (taskId: string, updatedFields: Partial<Task>) => void;
}

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
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee: task.assignee || '',
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        team: task.team || 'Unassigned',
      });
      
      // Notify that we're editing this task
      notifyEditing('', task.id);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'To Do',
        assignee: '',
        dueDate: '',
        tags: [],
        team: 'Unassigned',
      });
      
      // Notify that we're creating a task (no taskId)
      notifyEditing('', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
        e.preventDefault();
        if (!formData.tags?.includes(newTag.trim())) {
            const updatedTags = [...(formData.tags || []), newTag.trim()];
            setFormData(prev => ({ ...prev, tags: updatedTags }));
            if (task && onUpdate) {
                onUpdate(task.id, { tags: updatedTags });
            }
        }
        setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    setFormData(prev => ({ ...prev, tags: updatedTags }));
    if (task && onUpdate) {
        onUpdate(task.id, { tags: updatedTags });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave({
      id: task?.id || new Date().toISOString(),
      ...formData,
    });
  };

  // Debounced auto-save for description
  useEffect(() => {
    if (!task || !onUpdate) {
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

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-slate-50 dark:bg-[#0D1117] z-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white dark:bg-[#161B22] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#30363D] flex flex-col">
        <header className="p-4 flex-shrink-0 flex justify-between items-center border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{task ? 'Edit Task' : 'Create New Task'}</h2>
            {editors.length > 0 && <PresenceIndicator editors={editors} />}
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Task Title..."
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
             <label htmlFor="team" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Team</label>
             <select
                name="team"
                id="team"
                value={formData.team}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
             >
                <option value="Unassigned">Unassigned</option>
                {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
             </select>
             <p className="text-xs text-slate-500 mt-1">Only managers or members of this team will see this task.</p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assignee</label>
            <input
              type="text"
              name="assignee"
              id="assignee"
              value={formData.assignee}
              onChange={handleChange}
              placeholder="Assign to..."
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
             <div className="flex flex-wrap gap-2 mb-2">
                 {formData.tags?.map(tag => (
                     <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                         {tag}
                         <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-600 hover:bg-blue-200 focus:outline-none dark:text-blue-400 dark:hover:bg-blue-800"
                         >
                             &times;
                         </button>
                     </span>
                 ))}
             </div>
             <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag & press Enter"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
             />
          </div>
        </div>

        <footer className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-200 dark:border-[#30363D]">
          <div>
            {task && (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-[#161B22]"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex space-x-4">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#30363D] text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-[#414850] focus:outline-none"
              >
                  Cancel
              </button>
              <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#161B22]"
              >
                  {task ? 'Save' : 'Create'}
              </button>
          </div>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4 sm:p-8 overflow-hidden">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex-shrink-0">Description</label>
        <div className="flex-grow relative min-h-[200px]">
          <TiptapEditor
            content={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Add more details..."
            className="h-full"
          />
        </div>
      </main>
    </form>
  );
};

export default TaskModal;