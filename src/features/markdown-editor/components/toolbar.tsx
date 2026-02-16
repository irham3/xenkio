import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Undo2,
    Redo2,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    SquareCode,
    Table as TableIcon,
    Minus,
    MoreHorizontal,
    Eraser,
} from "lucide-react";

interface ToolbarProps {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    applyFormatting: (prefix: string, suffix?: string, defaultValue?: string) => void;
    insertLinePrefix: (prefix: string) => void;
    clearAll: () => void;
    transformText: (fn: (text: string) => string) => void;
}

export const Toolbar = ({ undo, redo, canUndo, canRedo, applyFormatting, insertLinePrefix, clearAll, transformText }: ToolbarProps) => {
    const [showTools, setShowTools] = useState(false);
    const tableTemplate = `| Column 1 | Column 2 | Column 3 |
| :--- | :--- | :--- |
| Row 1 | Row 1 | Row 1 |
| Row 2 | Row 2 | Row 2 |`;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 shrink-0 relative">
            {/* History Group */}
            <div className="flex items-center gap-0.5 mr-2 px-1 border-r border-gray-200">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="w-4 h-4" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Redo (Ctrl+Y/Ctrl+Shift+Z)"
                >
                    <Redo2 className="w-4 h-4" />
                </button>
            </div>

            {/* Formatting Group */}
            <div className="flex items-center gap-0.5 mr-2 px-1 border-r border-gray-200">
                <button
                    onClick={() => applyFormatting('**', '**', 'bold text')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('*', '*', 'italic text')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('<u>', '</u>', 'underlined text')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Underline"
                >
                    <Underline className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('~~', '~~', 'strikethrough text')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
            </div>

            {/* Headings Group */}
            <div className="flex items-center gap-0.5 mr-2 px-1 border-r border-gray-200">
                <button
                    onClick={() => insertLinePrefix('# ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('## ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('### ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('#### ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 4"
                >
                    <Heading4 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('##### ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 5"
                >
                    <Heading5 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('###### ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Heading 6"
                >
                    <Heading6 className="w-4 h-4" />
                </button>
            </div>

            {/* Lists & Blocks Group */}
            <div className="flex items-center gap-0.5 mr-2 px-1 border-r border-gray-200">
                <button
                    onClick={() => insertLinePrefix('- ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('1. ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('- [ ] ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Task List"
                >
                    <CheckSquare className="w-4 h-4" />
                </button>
                <button
                    onClick={() => insertLinePrefix('> ')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </button>
            </div>

            {/* Insert Group */}
            <div className="flex items-center gap-0.5 mr-2 px-1 border-r border-gray-200">
                <button
                    onClick={() => applyFormatting('[', '](https://example.com)', 'link text')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Link (Ctrl+K)"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('![alt text](', ')', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('`', '`', 'inline code')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Inline Code"
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('```javascript\\n', '\\n```', '// code here')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Code Block"
                >
                    <SquareCode className="w-4 h-4" />
                </button>
                <button
                    onClick={() => applyFormatting('\n' + tableTemplate + '\n', '', '')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Insert Table"
                >
                    <TableIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Tools Group */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => applyFormatting('\n---\n', '', '')}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                    title="Horizontal Rule"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <div className="relative group">
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className={cn(
                            "p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer",
                            showTools && "bg-gray-100 text-primary-600"
                        )}
                        title="Advanced Tools"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showTools && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowTools(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { transformText(t => t.toUpperCase()); setShowTools(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                                >
                                    UPPERCASE
                                    <span className="text-[10px] text-gray-400">ABC</span>
                                </button>
                                <button
                                    onClick={() => { transformText(t => t.toLowerCase()); setShowTools(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                                >
                                    lowercase
                                    <span className="text-[10px] text-gray-400">abc</span>
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button
                                    onClick={() => { transformText(t => t.replace(/[ \t]+/g, ' ')); setShowTools(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Remove Double Spaces
                                </button>
                                <button
                                    onClick={() => { transformText(t => t.split('\n').filter(l => l.trim() !== '').join('\n')); setShowTools(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Remove Empty Lines
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button
                                    onClick={() => { clearAll(); setShowTools(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                    <Eraser className="w-3 h-3" />
                                    Clear All Content
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
