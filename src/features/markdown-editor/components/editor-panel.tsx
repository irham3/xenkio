'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/shared';
import React from 'react';

interface EditorPanelProps {
    markdown: string;
    onUpdate: (val: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    formattedChars: string;
    onDownload: () => void;
    heightClass: string;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    id: string;
}

export function EditorPanel({
    markdown,
    onUpdate,
    onKeyDown,
    formattedChars,
    onDownload,
    heightClass,
    textareaRef,
    id
}: EditorPanelProps) {
    return (
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-baseline justify-between mb-3 shrink-0">
                <label htmlFor={id} className="text-sm font-semibold text-gray-800">
                    Markdown
                </label>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                    {formattedChars} chars
                </span>
            </div>
            <textarea
                ref={textareaRef}
                id={id}
                value={markdown}
                onChange={(e) => onUpdate(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Start writing your markdown here..."
                spellCheck={false}
                className={cn(
                    "w-full p-4 text-[14px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 overflow-y-auto",
                    heightClass
                )}
            />
            <div className="flex gap-2 mt-3 shrink-0">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onDownload}
                    disabled={!markdown.trim()}
                    className="h-8 gap-1.5 text-xs font-medium border-gray-200 hover:bg-gray-100 cursor-pointer"
                >
                    <Download className="w-3.5 h-3.5" />
                    Download .md
                </Button>
                <CopyButton
                    value={markdown}
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs font-medium border-gray-200"
                />
            </div>
        </div>
    );
}
