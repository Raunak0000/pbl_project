import React, { useState, useEffect, useCallback } from 'react';
import { Task, STATUSES, TEAMS, ActivityLog } from '../types';
import TiptapEditor from './TiptapEditor';
import { useLiveEditing } from '../contexts/LiveEditingContext';
import PresenceIndicator from './PresenceIndicator';
import { Tag, Clock, Users, Link2, FileText, CheckCircle2, ChevronDown, Flag, User as UserIcon, History } from 'lucide-react';
import { api } from '../services/api';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdate?: (taskId: string, updatedFields: Partial<Task>) => void;
}

const statusBadgeColors: Record<string, string> = {
  'To Do': 'bg-[#2D1F63] text-[#A78BFA] border-[#4C3D7A]',
  'In Progress': 'bg-[#1E3A5F] text-[#58A6FF] border-[#2D5A8E]',
  'Done': 'bg-[#0F3D20] text-[#3FB950] border-[#1A5C2E]',
  'Blocked': 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]',
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
  overdue: 'bg-[#3D0F0F] text-[#F85149] border-[#5C1A1A]',
  due_soon: 'bg-[#3D2E0A] text-[#D29922] border-[#5C440F]',
  upcoming: 'bg-[#0F3D20] text-[#3FB950] border-[#1A5C2E]',
};

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, onDelete, onUpdate }) => {
  const { getTaskEditors, notifyEditing } = useLiveEditing();
  const editors = task ? getTaskEditors(task.id) : [];

  // --- Activity Log State ---
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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

  // Fetch activity logs when modal opens for an existing task
  useEffect(() => {
    const isEdit = task && task.id !== '';
    if (!isEdit) {
      setLogs([]);
      return;
    }
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const fetchedLogs = await api.getTaskLogs(task.id);
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch activity logs', err);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
    fetchLogs();
  }, [task?.id]);

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
        team: task?.team || 'Unassigned',
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

  const formatLog = (log: ActivityLog): string => {
    const who = log.username;
    switch (log.action) {
      case 'TASK_CREATED':
        return `${who} created this task`;
      case 'TASK_DELETED':
        return `${who} deleted this task`;
      case 'STATUS_CHANGED':
        return `${who} moved status from "${log.oldValue ?? 'none'}" to "${log.newValue}"`;
      case 'ASSIGNEE_CHANGED':
        return `${who} changed assignee from "${log.oldValue ?? 'none'}" to "${log.newValue}"`;
      case 'DUE_DATE_CHANGED':
        return `${who} changed due date from "${log.oldValue ?? 'none'}" to "${log.newValue}"`;
      case 'TITLE_CHANGED':
        return `${who} renamed task from "${log.oldValue}" to "${log.newValue}"`;
      case 'DESCRIPTION_CHANGED':
        return `${who} updated the description`;
      case 'TAGS_CHANGED':
        return `${who} updated tags`;
      case 'BLOCKED_BY_CHANGED':
        return `${who} updated task dependencies`;
      default:
        return `${who} made a change`;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const dueDateState = getDueDateState(formData.dueDate);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-[#161B22] shadow-2xl w-full h-full flex flex-col md:flex-row overflow-hidden">

        {/* Left Sidebar (Metadata) */}
        <aside className="w-full md:w-[260px] flex-shrink-0 bg-[#0D1117] border-r border-[#21262D] flex flex-col overflow-y-auto">
          <div className="p-5 flex items-center justify-between border-b border-[#21262D]">
            <h3 className="font-semibold text-[#E6EDF3]">Project details</h3>
            <button onClick={onClose} className="text-[#8B949E] hover:text-[#E6EDF3] p-1 rounded-md hover:bg-[#21262D] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Status */}
            <div className="flex flex-col gap-2 border-b border-[#21262D] pb-4">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full appearance-none px-3 py-1.5 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[#3FB950] cursor-pointer ${statusBadgeColors[formData.status] || 'bg-[#21262D]'}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2 border-b border-[#21262D] pb-4">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <Flag size={14} /> Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full appearance-none pl-8 pr-3 py-1.5 bg-[#21262D] border border-[#30363D] rounded-md text-sm font-medium text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#3FB950] cursor-pointer hover:bg-[#30363D]"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                  <div className={`w-2 h-2 rounded-full ${formData.priority === 'high' ? 'bg-[#F85149]' : formData.priority === 'medium' ? 'bg-[#D29922]' : 'bg-[#484F58]'}`} />
                </div>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none" />
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-2 border-b border-[#21262D] pb-4">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <UserIcon size={14} /> Assignee
              </label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1F3D20] flex items-center justify-center border border-[#1A5C2E] shrink-0">
                  <span className="text-[10px] font-bold text-[#3FB950]">
                    {formData.assignee ? formData.assignee.substring(0, 2).toUpperCase() : '?'}
                  </span>
                </div>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  placeholder="Assign to..."
                  className="flex-1 bg-transparent border-none text-sm placeholder-[#484F58] focus:outline-none font-medium text-[#E6EDF3]"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2 border-b border-[#21262D] pb-4">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={14} /> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-[#3FB950]
                  ${dueDateState ? dueDateColors[dueDateState] : 'bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]'}
                `}
              />
            </div>

            {/* Team */}
            <div className="flex flex-col gap-2 border-b border-[#21262D] pb-4">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <Users size={14} /> Team
              </label>
              <div className="relative">
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full appearance-none px-3 py-1.5 bg-[#21262D] border border-[#30363D] rounded-md text-sm font-medium text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#3FB950] cursor-pointer hover:bg-[#30363D]"
                >
                  <option value="Unassigned">Unassigned</option>
                  {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={14} /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#21262D] text-[#8B949E] hover:bg-[#30363D] transition-colors">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-[#484F58] hover:text-[#F85149] focus:outline-none">&times;</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag and press Enter..."
                className="w-full px-3 py-1.5 bg-[#21262D] border border-[#30363D] rounded-md text-sm text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:ring-2 focus:ring-[#3FB950]"
              />
            </div>

            {/* Activity Log — only shown for existing tasks */}
            {task && task.id !== '' && (
              <div className="flex flex-col border-t border-[#21262D] pt-4 mt-2">
                <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <History size={14} /> Activity Log
                </label>
                <div className="flex-1 pr-1">
                  {logsLoading ? (
                    <p className="text-xs text-[#484F58] py-2">Loading activity...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-xs text-[#484F58] py-2">No activity yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {logs.map(log => (
                        <li key={log.id} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#1F3D20] border border-[#1A5C2E] flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-[#3FB950]">
                              {log.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#C9D1D9] leading-tight break-words">{formatLog(log)}</p>
                            <p className="text-[10px] text-[#484F58] mt-1">{formatTimestamp(log.timestamp)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Right Main Area */}
        <main className="flex-1 flex flex-col bg-[#161B22] overflow-hidden p-6 md:p-8">

          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              {editors.length > 0 && <PresenceIndicator editors={editors} />}
              {editors.length > 0 && <span className="text-xs font-medium text-[#58A6FF] animate-pulse">Live editing in progress...</span>}
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
            className="w-full text-3xl md:text-4xl font-bold text-[#E6EDF3] placeholder-[#484F58] border-none focus:outline-none focus:ring-0 mb-8 bg-transparent shrink-0"
          />

          {/* Editor section takes full remaining height */}
          <div className="flex-1 flex flex-col border border-[#21262D] rounded-xl overflow-hidden min-h-[300px]">
            <div className="bg-[#0D1117] border-b border-[#21262D] px-4 py-2 flex items-center gap-2 text-sm font-semibold text-[#8B949E] shrink-0">
              <FileText size={16} /> Description
            </div>
            <div className="flex-1 overflow-y-auto bg-[#0D1117]">
              <TiptapEditor
                content={formData.description}
                onChange={handleDescriptionChange}
                placeholder="What is this task about?"
                className="h-full min-h-full p-4"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <footer className="mt-8 pt-6 border-t border-[#21262D] flex items-center justify-between shrink-0">
            <div>
              {task && task.id !== '' && (
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="px-4 py-2 text-sm font-medium text-[#F85149] hover:bg-[#3D0F0F] rounded-lg transition-colors border border-transparent hover:border-[#5C1A1A]"
                >
                  Delete task
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold text-[#C9D1D9] bg-[#21262D] hover:bg-[#30363D] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="px-6 py-2 text-sm font-semibold text-white bg-[#238636] hover:bg-[#2EA043] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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