'use client';

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Code, Eye, ArrowsClockwise, Plus, X, Pencil, Columns, Rows, Lightning, LightningSlash, ArrowCounterClockwise, CaretDown, FileCode, FileText, BracketsCurly, Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { useHtmlViewer } from '../hooks/use-html-viewer';
import type { FileType } from '../types';

const FILE_TYPE_COLORS: Record<FileType, string> = {
    html: 'text-orange-500',
    css: 'text-sky-500',
    js: 'text-yellow-500',
};

const FILE_TYPE_ACTIVE_BORDER: Record<FileType, string> = {
    html: 'border-t-orange-400',
    css: 'border-t-sky-400',
    js: 'border-t-yellow-400',
};

const FILE_TYPE_PLACEHOLDER: Record<FileType, string> = {
    html: '<h1>Hello World</h1>\n<p>Your HTML here...</p>',
    css: 'body {\n  color: #333;\n}',
    js: 'console.log("Hello!");',
};

const FILE_TYPE_LABELS: Record<FileType, string> = {
    html: 'HTML',
    css: 'CSS',
    js: 'JavaScript',
};

function FileTypeIcon({ type, className }: { type: FileType; className?: string }) {
    if (type === 'html') return <FileCode className={className}  weight="duotone"/>;
    if (type === 'css') return <FileText className={className}  weight="duotone"/>;
    return <BracketsCurly className={className}  weight="duotone"/>;
}

export function HtmlViewerContent() {
    const {
        state,
        previewDoc,
        activeFile,
        renamingFileId,
        setRenamingFileId,
        setViewMode,
        setPreviewLayout,
        setAutoRefresh,
        setSingleFileContent,
        setActiveFile,
        updateFileContent,
        addFile,
        deleteFile,
        renameFile,
        manualRefresh,
        resetToDefault,
    } = useHtmlViewer();

    const [showAddMenu, setShowAddMenu] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingCursorRef = useRef<number | null>(null);

    // Close add-file menu on outside click
    useEffect(() => {
        if (!showAddMenu) return;
        const handler = (e: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
                setShowAddMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showAddMenu]);

    // Restore cursor position after React re-render (for Tab key handling)
    useEffect(() => {
        if (pendingCursorRef.current !== null && textareaRef.current) {
            textareaRef.current.selectionStart = pendingCursorRef.current;
            textareaRef.current.selectionEnd = pendingCursorRef.current;
            pendingCursorRef.current = null;
        }
    });

    const handleRenameStart = useCallback(
        (id: string, currentName: string) => {
            setRenamingFileId(id);
            setRenameValue(currentName);
        },
        [setRenamingFileId],
    );

    const handleRenameConfirm = useCallback(
        (id: string) => {
            if (renameValue.trim()) {
                renameFile(id, renameValue.trim());
            }
            setRenamingFileId(null);
        },
        [renameValue, renameFile, setRenamingFileId],
    );

    const handleRenameKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>, id: string) => {
            if (e.key === 'Enter') handleRenameConfirm(id);
            if (e.key === 'Escape') setRenamingFileId(null);
        },
        [handleRenameConfirm, setRenamingFileId],
    );

    const handleAddFile = useCallback(
        (type: FileType) => {
            addFile(type);
            setShowAddMenu(false);
        },
        [addFile],
    );

    const handleEditorKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const ta = e.currentTarget;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const val = ta.value;
                const newVal = val.substring(0, start) + '  ' + val.substring(end);
                pendingCursorRef.current = start + 2;
                if (state.viewMode === 'single') {
                    setSingleFileContent(newVal);
                } else if (activeFile) {
                    updateFileContent(activeFile.id, newVal);
                }
            }
        },
        [state.viewMode, activeFile, setSingleFileContent, updateFileContent],
    );

    const handleEditorChange = useCallback(
        (value: string) => {
            if (state.viewMode === 'single') {
                setSingleFileContent(value);
            } else if (activeFile) {
                updateFileContent(activeFile.id, value);
            }
        },
        [state.viewMode, activeFile, setSingleFileContent, updateFileContent],
    );

    const handleReset = useCallback(() => {
        if (showResetConfirm) {
            resetToDefault();
            setShowResetConfirm(false);
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    }, [showResetConfirm, resetToDefault]);

    const isHorizontal = state.previewLayout === 'horizontal';
    const editorValue =
        state.viewMode === 'single' ? state.singleFileContent : (activeFile?.content ?? '');

    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                {/* ── Toolbar ────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* View-mode toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('single')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                                    state.viewMode === 'single'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                                )}
                            >
                                <Code className="w-3.5 h-3.5"  weight="duotone"/>
                                Single File
                            </button>
                            <button
                                onClick={() => setViewMode('multi')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                                    state.viewMode === 'multi'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                                )}
                            >
                                <FileCode className="w-3.5 h-3.5"  weight="duotone"/>
                                Multi File
                            </button>
                        </div>

                        {/* Layout toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
                            <button
                                onClick={() => setPreviewLayout('horizontal')}
                                title="Side by side"
                                className={cn(
                                    'p-1.5 rounded-md transition-all',
                                    state.previewLayout === 'horizontal'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                                )}
                            >
                                <Columns className="w-3.5 h-3.5"  weight="duotone"/>
                            </button>
                            <button
                                onClick={() => setPreviewLayout('vertical')}
                                title="Stacked"
                                className={cn(
                                    'p-1.5 rounded-md transition-all',
                                    state.previewLayout === 'vertical'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                                )}
                            >
                                <Rows className="w-3.5 h-3.5"  weight="duotone"/>
                            </button>
                        </div>

                        {/* Auto-refresh toggle */}
                        <button
                            onClick={() => setAutoRefresh(!state.autoRefresh)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
                                state.autoRefresh
                                    ? 'bg-success-50 text-success-700 border-success-200'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
                            )}
                        >
                            {state.autoRefresh ? (
                                <>
                                    <Lightning className="w-3.5 h-3.5"  weight="duotone"/>
                                    Auto
                                </>
                            ) : (
                                <>
                                    <LightningSlash className="w-3.5 h-3.5"  weight="duotone"/>
                                    Manual
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Manual refresh button (always visible, highlighted when auto is off) */}
                        <button
                            onClick={manualRefresh}
                            title="Refresh preview"
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
                                !state.autoRefresh
                                    ? 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
                            )}
                        >
                            <ArrowsClockwise className="w-3.5 h-3.5"  weight="duotone"/>
                            Refresh
                        </button>

                        {/* Reset button with confirm */}
                        <button
                            onClick={handleReset}
                            title={showResetConfirm ? 'Click again to confirm reset' : 'Reset to default'}
                            className={cn(
                                'flex items-center gap-1.5 p-2 rounded-lg transition-all',
                                showResetConfirm
                                    ? 'bg-error-50 text-error-600 hover:bg-error-100'
                                    : 'text-gray-500 hover:text-error-600 hover:bg-error-50',
                            )}
                        >
                            {showResetConfirm ? (
                                <Check className="w-4 h-4"  weight="duotone"/>
                            ) : (
                                <ArrowCounterClockwise className="w-4 h-4"  weight="duotone"/>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Main editor + preview area ─────────────────── */}
                <div
                    className={cn(
                        'grid',
                        isHorizontal ? 'lg:grid-cols-2' : 'grid-cols-1',
                    )}
                >
                    {/* ── Editor panel ───────────────────────────── */}
                    <div
                        className={cn(
                            'flex flex-col',
                            isHorizontal
                                ? 'border-b lg:border-b-0 lg:border-r border-gray-200'
                                : 'border-b border-gray-200',
                        )}
                    >
                        {/* Editor header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                            <div className="flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-gray-400"  weight="duotone"/>
                                <span className="text-xs font-medium text-gray-400">Editor</span>
                            </div>
                            {state.viewMode === 'single' && (
                                <span className="text-xs text-gray-500">Full HTML document</span>
                            )}
                        </div>

                        {/* File tabs (multi mode) */}
                        {state.viewMode === 'multi' && (
                            <div className="flex items-center gap-0 px-2 pt-1.5 bg-gray-800 border-b border-gray-700 overflow-x-auto shrink-0">
                                {state.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className={cn(
                                            'group/tab flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg cursor-pointer transition-all border-t-2 whitespace-nowrap shrink-0',
                                            state.activeFileId === file.id
                                                ? cn(
                                                      'bg-gray-950 text-gray-100 border-b border-gray-950',
                                                      FILE_TYPE_ACTIVE_BORDER[file.type],
                                                  )
                                                : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700',
                                        )}
                                        onClick={() => setActiveFile(file.id)}
                                    >
                                        <FileTypeIcon
                                            type={file.type}
                                            className={cn('w-3 h-3', FILE_TYPE_COLORS[file.type])}
                                        />

                                        {renamingFileId === file.id ? (
                                            <input
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onKeyDown={(e) => handleRenameKeyDown(e, file.id)}
                                                onBlur={() => handleRenameConfirm(file.id)}
                                                className="w-24 text-xs bg-transparent border-b border-primary-400 text-gray-100 outline-none"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameStart(file.id, file.name);
                                                }}
                                            >
                                                {file.name}
                                            </span>
                                        )}

                                        {/* Rename icon */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRenameStart(file.id, file.name);
                                            }}
                                            className="opacity-0 group-hover/tab:opacity-100 p-0.5 rounded hover:bg-gray-600 transition-all text-gray-400 hover:text-gray-200"
                                            title="Rename"
                                        >
                                            <Pencil className="w-2.5 h-2.5"  weight="duotone"/>
                                        </button>

                                        {/* Delete icon (only when more than 1 file) */}
                                        {state.files.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteFile(file.id);
                                                }}
                                                className="opacity-0 group-hover/tab:opacity-100 p-0.5 rounded hover:bg-error-900 hover:text-error-400 transition-all text-gray-400"
                                                title="Delete file"
                                            >
                                                <X className="w-2.5 h-2.5"  weight="duotone"/>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Add file button */}
                                <div className="relative ml-1 shrink-0" ref={addMenuRef}>
                                    <button
                                        onClick={() => setShowAddMenu((v) => !v)}
                                        className="flex items-center gap-0.5 px-2 py-2 text-xs text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-all"
                                        title="Add new file"
                                    >
                                        <Plus className="w-3.5 h-3.5"  weight="duotone"/>
                                        <CaretDown className="w-3 h-3"  weight="duotone"/>
                                    </button>

                                    {showAddMenu && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[150px]">
                                            {(['html', 'css', 'js'] as FileType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleAddFile(type)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-all"
                                                >
                                                    <FileTypeIcon
                                                        type={type}
                                                        className={cn(
                                                            'w-3.5 h-3.5',
                                                            FILE_TYPE_COLORS[type],
                                                        )}
                                                    />
                                                    {FILE_TYPE_LABELS[type]} file
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Code textarea */}
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={editorValue}
                                onChange={(e) => handleEditorChange(e.target.value)}
                                onKeyDown={handleEditorKeyDown}
                                spellCheck={false}
                                className={cn(
                                    'w-full h-full min-h-[380px] p-4 font-mono text-sm leading-relaxed bg-gray-950 text-gray-100 outline-none resize-none border-0 caret-primary-400',
                                    state.viewMode === 'multi' &&
                                        activeFile &&
                                        `border-t-2 ${FILE_TYPE_ACTIVE_BORDER[activeFile.type]}`,
                                )}
                                placeholder={
                                    state.viewMode === 'single'
                                        ? '<!DOCTYPE html>\n<html>\n  ...\n</html>'
                                        : activeFile
                                          ? FILE_TYPE_PLACEHOLDER[activeFile.type]
                                          : ''
                                }
                            />
                        </div>
                    </div>

                    {/* ── Preview panel ──────────────────────────── */}
                    <div className="flex flex-col">
                        {/* Preview header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-gray-400"  weight="duotone"/>
                                <span className="text-xs font-medium text-gray-500">Preview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {state.autoRefresh ? 'Live' : 'Manual'}
                                </span>
                                <button
                                    onClick={manualRefresh}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
                                    title="Refresh preview"
                                >
                                    <ArrowsClockwise className="w-3.5 h-3.5"  weight="duotone"/>
                                </button>
                            </div>
                        </div>

                        {/* iframe */}
                        <iframe
                            srcDoc={previewDoc}
                            sandbox="allow-scripts"
                            className="flex-1 min-h-[380px] w-full bg-white border-0"
                            title="HTML Preview"
                        />
                    </div>
                </div>

                {/* ── Footer hint ────────────────────────────────── */}
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-4">
                    <p className="text-xs text-gray-400">
                        <kbd className="px-1.5 py-0.5 text-[11px] bg-gray-100 border border-gray-200 rounded font-mono">
                            Tab
                        </kbd>{' '}
                        inserts 2 spaces &nbsp;&middot;&nbsp; Double-click a tab to rename
                    </p>
                    {state.viewMode === 'multi' && (
                        <p className="text-xs text-gray-400">
                            Multi-file mode: CSS and JS are automatically injected into the HTML preview.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
