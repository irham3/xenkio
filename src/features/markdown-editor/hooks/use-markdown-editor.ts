import { useState, useCallback, useMemo } from 'react';
import { markdownToHtml, SAMPLE_MARKDOWN } from '../lib/markdown-utils';
import { ViewMode } from '../types';

export function useMarkdownEditor() {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [viewMode, setViewMode] = useState<ViewMode>('split');

    // Convert markdown to HTML whenever markdown changes
    const html = useMemo(() => markdownToHtml(markdown), [markdown]);

    const updateMarkdown = useCallback((value: string) => {
        setMarkdown(value);
    }, []);

    const clearMarkdown = useCallback(() => {
        setMarkdown('');
    }, []);

    const resetToSample = useCallback(() => {
        setMarkdown(SAMPLE_MARKDOWN);
    }, []);

    return {
        markdown,
        html,
        viewMode,
        setViewMode,
        updateMarkdown,
        clearMarkdown,
        resetToSample,
    };
}
