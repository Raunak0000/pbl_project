import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const MenuButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }> = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded transition-colors w-9 h-9 flex items-center justify-center ${isActive ? 'bg-slate-300 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-[#21262D]'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-300 dark:border-[#30363D]">
            <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5Zm.5 4.5a2.5 2.5 0 0 0 0-5H8v5h.5Z" /><path d="M6 4h8.5a4.5 4.5 0 1 1 0 9H6V4Zm0 9h6.5a2.5 2.5 0 1 1 0 5H6v-5Z" /></svg>
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 5h8v2h-3.5l-4 10H14v2H6v-2h3.5l4-10H10V5Z" /></svg>
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13h14v-2H5v2Zm.5-7.532a3.5 3.5 0 0 1 6.852-.52L13.1 8H18a1 1 0 1 1 0 2h-4.322l-1.385 3.463A3.501 3.501 0 0 1 5.5 18.5a3.5 3.5 0 0 1-1.148-6.685L5.5 5.468ZM8.5 8a1.5 1.5 0 1 0-2.852-.52L4.9 9.815a1.5 1.5 0 1 0 2.296 2.717L8.5 8Zm5.648 6.52a1.5 1.5 0 1 0 2.852.52l.748-2.332a1.5 1.5 0 1 0-2.296-2.717l-1.304 4.529Z" /></svg>
            </MenuButton>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1">
                 <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19h3v-6h4V5H4v14Zm13-14v14h3V5h-3Z" /></svg>
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
                 <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19h3v-6h4V5H4v14Zm14.28-11.85a3.5 3.5 0 0 0-4.654 4.932L16.5 18H13v2h8v-2.167l-3.28-5.467A3.5 3.5 0 0 0 18.28 7.15Z" /></svg>
            </MenuButton>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5h12v2H9V5Zm0 6h12v2H9v-2Zm0 6h12v2H9v-2ZM3.5 3.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm0 6a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm0 6a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z" /></svg>
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5h12v2H9V5Zm0 6h12v2H9v-2Zm0 6h12v2H9v-2ZM4 5h2v3H4V5Zm0 5.5h3V9H5.5V8H7V6H4v2h1.5v1H4v1.5ZM5.5 18H7v-6H4v1.5h1.5v1H4v1.5h1.5v2Z" /></svg>
            </MenuButton>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.983 3h-6v10h6V8.333H6.85L9.983 3Zm11 0h-6v10h6V8.333h-3.133L20.983 3Z" /></svg>
            </MenuButton>
        </div>
    );
};

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder, className }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                blockquote: { HTMLAttributes: { class: 'pl-4 border-l-4 border-slate-300 dark:border-slate-600' } }
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something amazing...',
            }),
            Link.configure({ openOnClick: false, autolink: true }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            let html = editor.getHTML();
            if (html === '<p></p>') {
                html = '';
            }
            onChange(html);
        },
    });

    useEffect(() => {
        if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    return (
        <div className={`bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md overflow-hidden flex flex-col ${className}`}>
            <MenuBar editor={editor} />
            <div className="flex-grow overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TiptapEditor;
