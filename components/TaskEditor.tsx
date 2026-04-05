
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import TiptapEditor from './TiptapEditor';
import { Save, Layout, Calendar } from 'lucide-react';

interface TaskEditorProps {
    task: Task;
    boardName: string;
    onUpdateTask: (boardId: string, taskId: string, updatedFields: Partial<Task>) => void;
    boardId: string;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, boardName, onUpdateTask, boardId }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);


    // Effect to update internal state when the task prop changes
    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
    }, [task]);

    // Effect for debounced autosaving
    useEffect(() => {
        const handler = setTimeout(() => {
            if (!task) return;

            const updates: Partial<Task> = {};
            if (title !== task.title) {
                updates.title = title;
            }
            if (description !== task.description) {
                updates.description = description;
            }

            if (Object.keys(updates).length > 0) {
                onUpdateTask(boardId, task.id, updates);
            }
        }, 750);

        return () => {
            clearTimeout(handler);
        };
    }, [title, description, task, boardId, onUpdateTask]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-brand-surface rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
            {/* Header Region */}
            <div className="flex-shrink-0 p-6 md:p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-200 dark:bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            <Layout className="w-3 h-3" />
                            {boardName}
                        </div>
                        {task.dueDate && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded border border-slate-200 dark:border-white/10 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                        )}
                        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                            <Save className="w-3 h-3" />
                            <span>Autosaving</span>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none"
                        placeholder="Task Title"
                    />
                </div>
            </div>

            {/* Editor Region */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-brand-surface">
                <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
                    <TiptapEditor
                        content={description}
                        onChange={setDescription}
                        placeholder="Describe the task..."
                    />
                </div>
            </div>
        </div>
    );
};

export default TaskEditor;
