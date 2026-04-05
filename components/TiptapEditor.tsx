import React, { useEffect } from 'react';
import {
    EditorRoot,
    EditorContent,
    EditorCommand,
    EditorCommandItem,
    EditorCommandList,
    EditorCommandEmpty,
    EditorBubble,
    EditorBubbleItem,
    type EditorContentProps,
    type SuggestionItem,
    createSuggestionItems,
    handleCommandNavigation,
    Command,
    renderItems,
    StarterKit,
    Placeholder,
    TiptapLink,
    useEditor,
} from 'novel';
import type { JSONContent } from 'novel';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code } from 'lucide-react';

// ─── Slash Command Suggestions ───
const suggestionItems = createSuggestionItems([
    {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: <Heading1 className="w-4 h-4" />,
        searchTerms: ['heading', 'h1', 'title'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: <Heading2 className="w-4 h-4" />,
        searchTerms: ['heading', 'h2', 'subtitle'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
        },
    },
    {
        title: 'Bullet List',
        description: 'Create a bullet list',
        icon: <List className="w-4 h-4" />,
        searchTerms: ['unordered', 'list', 'bullet'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Numbered List',
        description: 'Create a numbered list',
        icon: <ListOrdered className="w-4 h-4" />,
        searchTerms: ['ordered', 'list', 'number'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: 'Blockquote',
        description: 'Add a quote block',
        icon: <Quote className="w-4 h-4" />,
        searchTerms: ['quote', 'blockquote'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title: 'Code Block',
        description: 'Insert a code block',
        icon: <Code className="w-4 h-4" />,
        searchTerms: ['code', 'codeblock'],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
    },
]);

// ─── Bubble Menu Button ───
const BubbleButton: React.FC<{
    children: React.ReactNode;
    onSelect: (editor: any) => void;
    isActive?: boolean;
}> = ({ children, onSelect, isActive }) => (
    <EditorBubbleItem
        onSelect={onSelect}
    >
        <button
            type="button"
            className={`p-2 rounded transition-colors w-8 h-8 flex items-center justify-center text-sm
                ${isActive
                    ? 'bg-[#21262D] text-[#58A6FF]'
                    : 'hover:bg-[#21262D] text-[#E6EDF3]'
                }`}
        >
            {children}
        </button>
    </EditorBubbleItem>
);

// ─── Props Interface (same as original) ───
interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder, className }) => {
    return (
        <div className={`novel-editor bg-[#0D1117] border border-[#30363D] rounded-md overflow-hidden flex flex-col ${className || ''}`}>
            <EditorRoot>
                <EditorContent
                    initialContent={content ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] } : undefined}
                    extensions={[
                        StarterKit.configure({
                            heading: { levels: [1, 2, 3] },
                            blockquote: {
                                HTMLAttributes: {
                                    class: 'pl-4 border-l-4 border-[#30363D]',
                                },
                            },
                        }),
                        Placeholder.configure({
                            placeholder: placeholder || "Type '/' for commands…",
                        }),
                        TiptapLink.configure({
                            openOnClick: false,
                            autolink: true,
                        }),
                        Command.configure({
                            suggestion: {
                                items: () => suggestionItems,
                                render: renderItems,
                            },
                        }),
                    ]}
                    onCreate={({ editor }) => {
                        // Set HTML content on creation if provided
                        if (content && content !== '<p></p>' && content.trim() !== '') {
                            editor.commands.setContent(content, false);
                        }
                    }}
                    onUpdate={({ editor }) => {
                        let html = editor.getHTML();
                        if (html === '<p></p>') {
                            html = '';
                        }
                        onChange(html);
                    }}
                    editorProps={{
                        handleDOMEvents: {
                            keydown: (_view, event) => handleCommandNavigation(event),
                        },
                        attributes: {
                            class: 'prose prose-invert max-w-none min-h-[150px] text-[#E6EDF3] focus:outline-none',
                        },
                    }}
                    className="relative w-full flex-grow overflow-y-auto"
                >
                    {/* Slash Command Menu */}
                    <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-[#30363D] bg-[#161B22] px-1 py-2 shadow-xl transition-all">
                        <EditorCommandEmpty className="px-2 py-1 text-[#8B949E] text-sm">
                            No results
                        </EditorCommandEmpty>
                        <EditorCommandList>
                            {suggestionItems.map((item) => (
                                <EditorCommandItem
                                    value={item.title}
                                    onCommand={(val) => item.command?.(val)}
                                    key={item.title}
                                    className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm text-[#E6EDF3] hover:bg-[#21262D] cursor-pointer aria-selected:bg-[#21262D]"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#30363D] bg-[#0D1117]">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-xs text-[#8B949E]">{item.description}</p>
                                    </div>
                                </EditorCommandItem>
                            ))}
                        </EditorCommandList>
                    </EditorCommand>

                    {/* Bubble Menu (formatting toolbar) */}
                    <EditorBubble
                        tippyOptions={{
                            placement: 'top',
                        }}
                        className="flex items-center gap-0.5 rounded-md border border-[#30363D] bg-[#161B22] p-1 shadow-xl"
                    >
                        <BubbleButton onSelect={(editor) => editor.chain().focus().toggleBold().run()}>
                            <Bold className="w-3.5 h-3.5" />
                        </BubbleButton>
                        <BubbleButton onSelect={(editor) => editor.chain().focus().toggleItalic().run()}>
                            <Italic className="w-3.5 h-3.5" />
                        </BubbleButton>
                        <BubbleButton onSelect={(editor) => editor.chain().focus().toggleStrike().run()}>
                            <Strikethrough className="w-3.5 h-3.5" />
                        </BubbleButton>
                        <BubbleButton onSelect={(editor) => editor.chain().focus().toggleCode().run()}>
                            <Code className="w-3.5 h-3.5" />
                        </BubbleButton>
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    );
};

export default TiptapEditor;
