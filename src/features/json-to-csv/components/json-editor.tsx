
import React, { useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
    value: string;
    onChange: (val: string) => void;
    error: string | null;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

interface JsonToken {
    text: string;
    type: 'key' | 'string' | 'keyword' | 'number' | 'punctuation' | 'whitespace' | 'error';
    start: number;
    end: number;
}

function tokenizeJson(input: string): JsonToken[] {
    const tokens: JsonToken[] = [];
    // Regex explanation:
    // Group 1: String literals (captures the string including quotes)
    // Group 2: Keywords (true|false|null)
    // Group 3: Numbers
    // Group 4: Punctuation (braces, brackets, comma, colon)
    // Group 5: Whitespace (spaces, tabs, newlines)
    const regex = /("(?:[^\\"]|\\.)*")|(\b(?:true|false|null)\b)|(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|([\[\]{},:])|(\s+)/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
        // Find text between last match and current match (invalid JSON chars)
        if (match.index > lastIndex) {
            tokens.push({
                text: input.slice(lastIndex, match.index),
                type: 'error',
                start: lastIndex,
                end: match.index
            });
        }

        const fullMatch = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;
        let type: JsonToken['type'] = 'whitespace';

        if (match[1]) {
            // It's a string, check context to see if it's a key
            // Look ahead for colon (ignoring whitespace)
            const remaining = input.slice(endIndex);
            const colonMatch = /^\s*:/.test(remaining);
            type = colonMatch ? 'key' : 'string';
        } else if (match[2]) {
            type = 'keyword';
        } else if (match[3]) {
            type = 'number';
        } else if (match[4]) {
            type = 'punctuation';
        } else if (match[5]) {
            type = 'whitespace';
        }

        tokens.push({
            text: fullMatch,
            type,
            start: startIndex,
            end: endIndex
        });

        lastIndex = regex.lastIndex;
    }

    // Capture remaining invalid chars at the end
    if (lastIndex < input.length) {
        tokens.push({
            text: input.slice(lastIndex),
            type: 'error',
            start: lastIndex,
            end: input.length
        });
    }

    return tokens;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
    value,
    onChange,
    error,
    placeholder,
    className,
    readOnly
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    // Sync scroll position from textarea to pre
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (preRef.current) {
            preRef.current.scrollTop = e.currentTarget.scrollTop;
            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    // Parse error position
    const errorPosition = useMemo(() => {
        if (!error) return null;
        // Looking for standard JSON.parse error format "Unexpected token ... in JSON at position X"
        const match = error.match(/position (\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    }, [error]);

    const highlightContent = useMemo(() => {
        const tokens = tokenizeJson(value);
        return tokens.map((token, index) => {
            let className = '';

            // Standard Syntax Highlighting
            switch (token.type) {
                case 'key':
                    className = 'text-blue-600 font-semibold';
                    break;
                case 'string':
                    className = 'text-green-600';
                    break;
                case 'keyword':
                    className = 'text-purple-600 font-bold';
                    break;
                case 'number':
                    className = 'text-orange-600';
                    break;
                case 'punctuation':
                    className = 'text-gray-500';
                    break;
                case 'error':
                    className = 'text-red-600 bg-red-50';
                    break;
                default:
                    className = '';
            }

            // Error Underline Logic
            // If we have an error position, we underline the token at/near that position
            let isErrorContext = false;

            if (errorPosition !== null) {
                // If the error position falls within this token
                if (errorPosition >= token.start && errorPosition <= token.end) {
                    isErrorContext = true;
                }
                // If error is at the very end of input and this is the last token (often whitespace)
                if (errorPosition === value.length && index === tokens.length - 1) {
                    isErrorContext = true;
                }
            }

            return (
                <span
                    key={index}
                    className={cn(
                        className,
                        isErrorContext && "wavy-underline decoration-red-500 decoration-wavy underline underline-offset-4 bg-red-50/50 rounded-sm"
                    )}
                >
                    {token.text}
                </span>
            );
        });
    }, [value, errorPosition]);

    // Apply exact styling to match overlay perfect
    const sharedStyles = "absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border-0 outline-none w-full h-full text-left";

    return (
        <div className={cn("relative w-full h-full bg-white rounded-md overflow-hidden", className)}>
            {/* Syntax Highlighting Layer (Bottom) */}
            <pre
                ref={preRef}
                aria-hidden="true"
                className={cn(
                    sharedStyles,
                    "pointer-events-none z-0 select-none bg-transparent m-0 overflow-hidden"
                )}
                style={{ tabSize: 4 }}
            >
                {highlightContent}
                {/* Ensure explicit line break rendering matches textarea */}
                {value.endsWith('\n') && <br />}
            </pre>

            {/* Input Layer (Top) */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
                    {/* Placeholder rendered manually to avoid interference */}
                </div>
            )}
        </div>
    );
};
