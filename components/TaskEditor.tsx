import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import TiptapEditor from './TiptapEditor';


interface TaskEditorProps {
  task: Task;
  boardName: string;
  onUpdateTask: (boardId: string, taskId: string, updatedFields: Partial<Task>) => void;
  boardId: string;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, boardName, onUpdateTask, boardId }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  // Effect to update internal state when the task prop changes (e.g., user selects a different task)
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
      }, 750); // 750ms debounce delay

      return () => {
          clearTimeout(handler);
      };
  }, [title, description, task, boardId, onUpdateTask]);

  const handleHelpMeWrite = async () => {
    if (!title) {
        alert("Please enter a title first to generate a description.");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a detailed, well-structured task description for the following task title: "${title}". Use formatting like headers, bold text, and bullet points where appropriate to make it clear and actionable.`
        });
        const generatedText = result.text;
        if (generatedText) {
            // Convert markdown-like text to HTML for Tiptap
            let htmlContent = generatedText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^\* (.*$)/gm, '<li>$1</li>')
                .replace(/\n/g, '<br/>');

            // Wrap list items
             if(htmlContent.includes('<li>')) {
                // A bit of regex magic to wrap consecutive <li> items in a <ul>
                htmlContent = htmlContent.replace(/(<li>.*<\/li>)(?![\s\S]*<li>)/s, '$1</ul>');
                htmlContent = htmlContent.replace(/<li>/, '<ul><li>');
                htmlContent = htmlContent.replace(/<\/li><br\/><li>/g, '</li><li>');
            }

            setDescription(htmlContent);
        }
    } catch (error) {
        console.error("Error generating content:", error);
        alert("Failed to generate content. Please check the console for details.");
    } finally {
        setIsGenerating(false);
    }
  };


  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-slate-800 dark:text-slate-200">
        <div className="bg-white dark:bg-[#161B22] p-8 md:p-12 rounded-lg shadow-lg">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-4xl font-extrabold mb-2 tracking-tighter focus:outline-none dark:placeholder:text-slate-600"
                placeholder="Untitled Task"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">In board: <span className="font-semibold">{boardName}</span></p>


            
            <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Start writing, or use the AI to help..."
            />
        </div>
    </div>
  );
};

export default TaskEditor;
