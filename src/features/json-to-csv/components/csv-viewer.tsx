
import React, { useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CsvViewerProps {
    value: string;
    delimiter: string;
    className?: string;
    readOnly?: boolean;
    placeholder?: string;
}

export function CsvViewer({
    value,
    delimiter,
    className,
    readOnly = true,
    placeholder
}: CsvViewerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.currentTarget.scrollTop;
            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    const highlightContent = useMemo(() => {
        if (!value) return null;

        const lines = value.split('\n');
        return lines.map((line, i) => {
            const isHeader = i === 0;
            const parts: { text: string; type: 'header' | 'value' | 'delimiter' }[] = [];

            let current = '';
            let inQuote = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                // Check if delimiter match (could be multi-char like '\t' but passed as string)
                // Assuming single char delimiter for simple visualization logic or handled by caller
                // If delimiter is special char like \t, it's length 1.
                const isDelim = char === delimiter && !inQuote;

                if (char === '"') {
                    inQuote = !inQuote;
                }

                if (isDelim) {
                    if (current) parts.push({ text: current, type: isHeader ? 'header' : 'value' });
                    parts.push({ text: char, type: 'delimiter' });
                    current = '';
                } else {
                    current += char;
                }
            }
            if (current || line.endsWith(delimiter)) {
                parts.push({ text: current, type: isHeader ? 'header' : 'value' });
            } if (parts.length === 0 && line === '') {
                // Empty line
                parts.push({ text: '\n', type: 'delimiter' });
            }

            return (
                <div key={i} className="min-h-[1.5em]">
                    {parts.map((part, j) => (
                        <span
                            key={j}
                            className={cn(
                                part.type === 'header' && "font-bold text-gray-900",
                                part.type === 'value' && "text-gray-600",
                                part.type === 'delimiter' && "text-gray-300 font-light select-none bg-gray-50 px-0.5 rounded-sm mx-0.5" // styled delimiter
                            )}
                        >
                            {part.text}
                        </span>
                    ))}
                </div>
            );
        });
    }, [value, delimiter]);

    const sharedStyles = "absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre border-0 outline-none w-full h-full text-left overflow-auto";

    return (
        <div className={cn("relative w-full h-full bg-white rounded-md overflow-hidden group", className)}>
            {/* Syntax Highlighting Layer (Bottom) */}
            <div
                ref={preRef}
                aria-hidden="true"
                className={cn(
                    sharedStyles,
                    "pointer-events-none z-0 select-none bg-transparent m-0 overflow-auto"
                )}
                style={{ tabSize: 4 }}
            >
                {highlightContent}
                {/* Extra space for scroll */}
                <div className="h-8 w-full"></div>
            </div>

            {/* Input Layer (Top) */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={() => { }}
                onScroll={handleScroll}
                readOnly={readOnly}
                spellCheck={false}
                placeholder={placeholder}
                className={cn(
                    sharedStyles,
                    "z-10 bg-transparent text-transparent caret-gray-900 resize-none tabular-nums selection:bg-blue-500/20 selection:text-transparent",
                    "focus:ring-0 focus:outline-none focus:border-0"
                )}
                style={{ tabSize: 4 }}
            />

            {placeholder && !value && (
                <div className="absolute top-4 left-4 text-gray-400 font-mono text-sm pointer-events-none z-20">
                    {placeholder}
                </div>
            )}
        </div>
    );
}
