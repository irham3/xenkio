import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { markdownToHtml, SAMPLE_MARKDOWN } from '../lib/markdown-utils';
import { ViewMode } from '../types';

export function useMarkdownEditor() {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // History management
    const historyRef = useRef<{
        past: string[];
        present: string;
        future: string[];
    }>({
        past: [],
        present: SAMPLE_MARKDOWN,
        future: []
    });

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Convert markdown to HTML whenever markdown changes
    const html = useMemo(() => markdownToHtml(markdown), [markdown]);

    const updateMarkdown = useCallback((value: string, skipHistory = false) => {
        if (!skipHistory && value !== historyRef.current.present) {
            historyRef.current.past.push(historyRef.current.present);
            historyRef.current.present = value;
            historyRef.current.future = [];

            // Limit history size to 50
            if (historyRef.current.past.length > 50) {
                historyRef.current.past.shift();
            }

            setCanUndo(true);
            setCanRedo(false);
        }
        setMarkdown(value);
    }, []);

    const undo = useCallback(() => {
        const { past, present, future } = historyRef.current;
        if (past.length === 0) return;

        const previous = past.pop();
        if (previous !== undefined) {
            future.unshift(present);
            historyRef.current.present = previous;
            setMarkdown(previous);
            setCanUndo(past.length > 0);
            setCanRedo(true);
        }
    }, []);

    const redo = useCallback(() => {
        const { past, present, future } = historyRef.current;
        if (future.length === 0) return;

        const next = future.shift();
        if (next !== undefined) {
            past.push(present);
            historyRef.current.present = next;
            setMarkdown(next);
            setCanUndo(true);
            setCanRedo(future.length > 0);
        }
    }, []);

    const clearMarkdown = useCallback(() => {
        updateMarkdown('');
    }, [updateMarkdown]);

    const resetToSample = useCallback(() => {
        updateMarkdown(SAMPLE_MARKDOWN);
    }, [updateMarkdown]);

    return {
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
    };
}
