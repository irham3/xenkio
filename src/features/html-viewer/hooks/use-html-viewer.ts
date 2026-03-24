'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { CodeFile, FileType, HtmlViewerState, PreviewLayout, ViewMode } from '../types';

const STORAGE_KEY = 'html-viewer-state';

const DEFAULT_SINGLE_FILE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style>
    body {
      font-family: sans-serif;
      max-width: 640px;
      margin: 2rem auto;
      padding: 0 1rem;
      color: #333;
    }
    h1 { color: #0ea5e9; }
    button {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    button:hover { background: #0284c7; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit this HTML to see changes in the preview.</p>
  <button onclick="greet()">Click me!</button>

  <script>
    function greet() {
      alert('Hello from JavaScript!');
    }
  </script>
</body>
</html>`;

const DEFAULT_FILES: CodeFile[] = [
    {
        id: 'default-html',
        name: 'index.html',
        type: 'html',
        content: `<h1>Hello, World!</h1>\n<p>Edit this HTML to see changes in the preview.</p>\n<button onclick="greet()">Click me!</button>`,
    },
    {
        id: 'default-css',
        name: 'styles.css',
        type: 'css',
        content: `body {\n  font-family: sans-serif;\n  max-width: 640px;\n  margin: 2rem auto;\n  padding: 0 1rem;\n  color: #333;\n}\n\nh1 {\n  color: #0ea5e9;\n}\n\nbutton {\n  background: #0ea5e9;\n  color: white;\n  border: none;\n  padding: 0.5rem 1.25rem;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.875rem;\n}\n\nbutton:hover {\n  background: #0284c7;\n}`,
    },
    {
        id: 'default-js',
        name: 'script.js',
        type: 'js',
        content: `function greet() {\n  alert('Hello from JavaScript!');\n}`,
    },
];

const DEFAULT_STATE: HtmlViewerState = {
    viewMode: 'multi',
    activeFileId: 'default-html',
    files: DEFAULT_FILES,
    singleFileContent: DEFAULT_SINGLE_FILE,
    previewLayout: 'horizontal',
    autoRefresh: true,
};

function buildMultiFileDoc(files: CodeFile[]): string {
    const htmlFile = files.find((f) => f.type === 'html');
    const cssFiles = files.filter((f) => f.type === 'css');
    const jsFiles = files.filter((f) => f.type === 'js');

    const cssBlock = cssFiles.length
        ? `<style>\n${cssFiles.map((f) => `/* ${f.name} */\n${f.content}`).join('\n\n')}\n</style>`
        : '';

    const jsBlock = jsFiles.length
        ? `<script>\n${jsFiles.map((f) => `// ${f.name}\n${f.content}`).join('\n\n')}\n</script>`
        : '';

    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n${cssBlock}\n</head>\n<body>\n${htmlFile?.content ?? ''}\n${jsBlock}\n</body>\n</html>`;
}

export function useHtmlViewer() {
    const [state, setState] = useState<HtmlViewerState>(DEFAULT_STATE);
    const [previewDoc, setPreviewDoc] = useState<string>('');
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<HtmlViewerState>;
                setState((prev) => ({ ...prev, ...parsed }));
            }
        } catch {
            // ignore
        }
    }, []);

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // ignore
        }
    }, [state]);

    const buildPreview = useCallback((s: HtmlViewerState) => {
        const doc = s.viewMode === 'single' ? s.singleFileContent : buildMultiFileDoc(s.files);
        setPreviewDoc(doc);
    }, []);

    // Auto-refresh with debounce
    useEffect(() => {
        if (!state.autoRefresh) return;
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
            buildPreview(state);
        }, 300);
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [state, buildPreview]);

    // Initial preview render (even when autoRefresh is off)
    useEffect(() => {
        buildPreview(state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const manualRefresh = useCallback(() => {
        buildPreview(state);
    }, [state, buildPreview]);

    const setViewMode = useCallback((viewMode: ViewMode) => {
        setState((prev) => ({ ...prev, viewMode }));
    }, []);

    const setPreviewLayout = useCallback((previewLayout: PreviewLayout) => {
        setState((prev) => ({ ...prev, previewLayout }));
    }, []);

    const setAutoRefresh = useCallback((autoRefresh: boolean) => {
        setState((prev) => ({ ...prev, autoRefresh }));
    }, []);

    const setSingleFileContent = useCallback((content: string) => {
        setState((prev) => ({ ...prev, singleFileContent: content }));
    }, []);

    const setActiveFile = useCallback((id: string) => {
        setState((prev) => ({ ...prev, activeFileId: id }));
    }, []);

    const updateFileContent = useCallback((id: string, content: string) => {
        setState((prev) => ({
            ...prev,
            files: prev.files.map((f) => (f.id === id ? { ...f, content } : f)),
        }));
    }, []);

    const addFile = useCallback((type: FileType) => {
        const timestamp = Math.floor(Date.now() / 1000) % 10000;
        const ext = type === 'html' ? 'html' : type === 'css' ? 'css' : 'js';
        const id = `${type}-${timestamp}`;
        const newFile: CodeFile = { id, name: `file-${timestamp}.${ext}`, type, content: '' };
        setState((prev) => ({
            ...prev,
            files: [...prev.files, newFile],
            activeFileId: id,
        }));
    }, []);

    const deleteFile = useCallback((id: string) => {
        setState((prev) => {
            const newFiles = prev.files.filter((f) => f.id !== id);
            if (newFiles.length === 0) return prev;
            const newActiveId =
                prev.activeFileId === id ? newFiles[newFiles.length - 1].id : prev.activeFileId;
            return { ...prev, files: newFiles, activeFileId: newActiveId };
        });
    }, []);

    const renameFile = useCallback((id: string, name: string) => {
        setState((prev) => ({
            ...prev,
            files: prev.files.map((f) => (f.id === id ? { ...f, name } : f)),
        }));
    }, []);

    const resetToDefault = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    const activeFile = useMemo(
        () => state.files.find((f) => f.id === state.activeFileId) ?? state.files[0] ?? null,
        [state.files, state.activeFileId],
    );

    return {
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
    };
}
