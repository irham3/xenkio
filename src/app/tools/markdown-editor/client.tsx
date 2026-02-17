"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { useMarkdownEditor } from "@/features/markdown-editor/hooks/use-markdown-editor";
import { downloadFile, getWordCount, getCharacterCount, getLineCount } from "@/features/markdown-editor/lib/markdown-utils";
import { cn } from "@/lib/utils";
import { Toolbar } from "@/features/markdown-editor/components/toolbar";
import { MarkdownHeader } from "@/features/markdown-editor/components/markdown-header";
import { EditorPanel } from "@/features/markdown-editor/components/editor-panel";
import { PreviewPanel } from "@/features/markdown-editor/components/preview-panel";

export function MarkdownEditorClient() {
    const {
        markdown,
        html,
        viewMode,
        setViewMode,
        updateMarkdown,
        clearMarkdown,
        resetToSample,
        undo,
        redo,
        canUndo,
        canRedo,
        isMounted,
    } = useMarkdownEditor();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fsTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Handle escape key to exit fullscreen
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    // Lock body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    const handleDownloadMarkdown = () => {
        downloadFile(markdown, 'document.md', 'text/markdown');
    };

    const handleDownloadHtml = () => {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1f2328; }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    code { background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 6px; font-family: ui-monospace, monospace; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 0.25em solid #d0d7de; padding-left: 1em; color: #656d76; margin: 0; }
    table { border-collapse: collapse; } th, td { border: 1px solid #d0d7de; padding: 6px 13px; }
    th { background: #f6f8fa; } a { color: #0969da; text-decoration: none; }
    ul, ol { padding-left: 2em; }
  </style>
</head>
<body>${html}</body>
</html>`;
        downloadFile(fullHtml, 'document.html', 'text/html');
    };

    const words = getWordCount(markdown);
    const chars = getCharacterCount(markdown);
    const lines = getLineCount(markdown);

    const formattedChars = isMounted ? chars.toLocaleString() : chars.toString();
    const formattedWords = isMounted ? words.toLocaleString() : words.toString();
    const formattedLines = isMounted ? lines.toLocaleString() : lines.toString();

    const applyFormatting = useCallback((prefix: string, suffix: string = '', defaultValue: string = '') => {
        const textarea = isFullscreen ? fsTextareaRef.current : textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd, value } = textarea;
        const selection = value.substring(selectionStart, selectionEnd);

        const content = selection || defaultValue;
        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionEnd);

        const newValue = before + prefix + content + suffix + after;
        updateMarkdown(newValue);

        setTimeout(() => {
            textarea.focus();
            if (selection) {
                textarea.selectionStart = selectionStart;
                textarea.selectionEnd = selectionStart + prefix.length + content.length + suffix.length;
            } else {
                textarea.selectionStart = selectionStart + prefix.length;
                textarea.selectionEnd = selectionStart + prefix.length + content.length;
            }
        }, 0);
    }, [isFullscreen, updateMarkdown]);

    const insertLinePrefix = useCallback((prefix: string) => {
        const textarea = isFullscreen ? fsTextareaRef.current : textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd, value } = textarea;
        const beforeSelection = value.substring(0, selectionStart);

        const lineStart = beforeSelection.lastIndexOf('\n') + 1;
        const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

        updateMarkdown(newValue);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = selectionStart + prefix.length;
            textarea.selectionEnd = selectionEnd + prefix.length;
        }, 0);
    }, [isFullscreen, updateMarkdown]);

    const transformText = useCallback((fn: (text: string) => string) => {
        const textarea = isFullscreen ? fsTextareaRef.current : textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd, value } = textarea;
        const selection = value.substring(selectionStart, selectionEnd);

        if (selection) {
            const before = value.substring(0, selectionStart);
            const after = value.substring(selectionEnd);
            const transformed = fn(selection);
            updateMarkdown(before + transformed + after);

            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = selectionStart;
                textarea.selectionEnd = selectionStart + transformed.length;
            }, 0);
        } else {
            updateMarkdown(fn(value));
        }
    }, [isFullscreen, updateMarkdown]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd, value } = textarea;

        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            if (e.shiftKey) {
                e.preventDefault();
                redo();
            } else {
                e.preventDefault();
                undo();
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
            return;
        }

        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();

            if (selectionStart === selectionEnd) {
                const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
                updateMarkdown(newValue);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
                }, 0);
            } else {
                const beforeSelection = value.substring(0, selectionStart);
                const selection = value.substring(selectionStart, selectionEnd);

                const lineStart = beforeSelection.lastIndexOf('\n') + 1;
                const prefix = beforeSelection.substring(lineStart);
                const indentedSelection = ('  ' + prefix + selection).replace(/\n/g, '\n  ');
                const newValue = beforeSelection.substring(0, lineStart) + indentedSelection + value.substring(selectionEnd);

                updateMarkdown(newValue);
            }
            return;
        }

        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();

            const beforeSelection = value.substring(0, selectionStart);
            const lineStart = beforeSelection.lastIndexOf('\n') + 1;
            const currentLine = value.substring(lineStart);

            if (currentLine.startsWith('  ')) {
                const newValue = value.substring(0, lineStart) + currentLine.substring(2);
                updateMarkdown(newValue);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - 2);
                }, 0);
            }
            return;
        }

        if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            applyFormatting('**', '**', 'bold');
            return;
        }

        if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            applyFormatting('*', '*', 'italic');
            return;
        }

        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            applyFormatting('[', '](url)', 'text');
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            const beforeCursor = value.substring(0, selectionStart);
            const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
            const currentLine = beforeCursor.substring(currentLineStart);
            const indentMatch = currentLine.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1] : '';

            const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
            if (listMatch && currentLine.trim() !== listMatch[0].trim()) {
                e.preventDefault();
                const listPrefix = listMatch[1] + (listMatch[2].match(/\d+\./) ?
                    (parseInt(listMatch[2]) + 1) + '. ' :
                    listMatch[2] + ' ');
                const newValue = value.substring(0, selectionStart) + '\n' + listPrefix + value.substring(selectionEnd);
                updateMarkdown(newValue);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + listPrefix.length;
                }, 0);
                return;
            }

            if (indent) {
                e.preventDefault();
                const newValue = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
                updateMarkdown(newValue);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length;
                }, 0);
            }
        }
    };

    return (
        <>
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <MarkdownHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        formattedWords={formattedWords}
                        formattedChars={formattedChars}
                        formattedLines={formattedLines}
                        onLoadSample={resetToSample}
                        isFullscreen={true}
                        setIsFullscreen={setIsFullscreen}
                    />
                    {(viewMode === 'editor' || viewMode === 'split') && (
                        <Toolbar
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            applyFormatting={applyFormatting}
                            insertLinePrefix={insertLinePrefix}
                            clearAll={clearMarkdown}
                            transformText={transformText}
                        />
                    )}
                    <div className={cn(
                        "grid gap-0 flex-1 overflow-hidden",
                        viewMode === 'split' ? "lg:grid-cols-2" : "grid-cols-1"
                    )}>
                        {(viewMode === 'editor' || viewMode === 'split') && (
                            <EditorPanel
                                id="markdown-input-fs"
                                markdown={markdown}
                                onUpdate={updateMarkdown}
                                onKeyDown={handleKeyDown}
                                formattedChars={formattedChars}
                                onDownload={handleDownloadMarkdown}
                                heightClass="h-full"
                                textareaRef={fsTextareaRef}
                            />
                        )}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <PreviewPanel
                                html={html}
                                markdown={markdown}
                                onDownload={handleDownloadHtml}
                                heightClass="h-full"
                            />
                        )}
                    </div>
                </div>
            )}

            <div className={cn("w-full pt-4 pb-12", isFullscreen && "invisible")}>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft flex flex-col h-[70vh]">
                    <MarkdownHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        formattedWords={formattedWords}
                        formattedChars={formattedChars}
                        formattedLines={formattedLines}
                        onLoadSample={resetToSample}
                        isFullscreen={false}
                        setIsFullscreen={setIsFullscreen}
                    />
                    {(viewMode === 'editor' || viewMode === 'split') && (
                        <Toolbar
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            applyFormatting={applyFormatting}
                            insertLinePrefix={insertLinePrefix}
                            clearAll={clearMarkdown}
                            transformText={transformText}
                        />
                    )}
                    <div className={cn(
                        "grid gap-0 flex-1 overflow-hidden",
                        viewMode === 'split' ? "lg:grid-cols-2" : "grid-cols-1"
                    )}>
                        {(viewMode === 'editor' || viewMode === 'split') && (
                            <EditorPanel
                                id="markdown-input"
                                markdown={markdown}
                                onUpdate={updateMarkdown}
                                onKeyDown={handleKeyDown}
                                formattedChars={formattedChars}
                                onDownload={handleDownloadMarkdown}
                                heightClass="h-[calc(100vh-480px)] min-h-[250px]"
                                textareaRef={textareaRef}
                            />
                        )}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <PreviewPanel
                                html={html}
                                markdown={markdown}
                                onDownload={handleDownloadHtml}
                                heightClass="h-[calc(100vh-480px)] min-h-[250px]"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
