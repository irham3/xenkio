import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversionStatus, PyodideInterface, LoadingStrategy, MicropipInterface } from '../types';

declare global {
    interface Window {
        loadPyodide: () => Promise<PyodideInterface>;
    }
}

/**
 * Mapping of file extensions to the pip packages they require.
 * Extensions not listed here use only Python built-in modules.
 */
const EXTENSION_DEPS: Record<string, string> = {
    pdf:  'pdfminer.six',
    docx: 'mammoth',
    xlsx: 'openpyxl',
    xls:  'openpyxl',
    pptx: 'python-pptx',
    html: 'beautifulsoup4',
    htm:  'beautifulsoup4',
    rtf:  'striprtf',
};

/** All format libraries needed for the preload strategy. */
const PRELOAD_PACKAGES = [
    'pdfminer.six',
    'python-docx',
    'python-pptx',
    'openpyxl',
    'pandas',
    'xlrd',
    'mammoth',
    'beautifulsoup4',
    'striprtf',
];

/** Fetch a Python script from /public/scripts/ and return its text. */
async function fetchPythonScript(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return response.text();
}

export function useDocToMd(strategy: LoadingStrategy = 'preload') {
    const [status, setStatus] = useState<ConversionStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [markdown, setMarkdown] = useState<string | null>(null);
    const pyodideRef = useRef<PyodideInterface | null>(null);

    const initPyodide = useCallback(async () => {
        if (pyodideRef.current) return;

        try {
            setStatus('loading_pyodide');

            // Load the Pyodide runtime if not already present
            if (!window.loadPyodide) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                    document.body.appendChild(script);
                });
            }

            const pyodide = await window.loadPyodide();
            pyodideRef.current = pyodide;

            setStatus('installing_deps');
            await pyodide.loadPackage('micropip');
            const micropip = pyodide.pyimport('micropip') as MicropipInterface;

            // Fetch & run mock setup (onnxruntime, magika, requests, pdfplumber)
            micropip.add_mock_package('onnxruntime', '1.17.0');
            const mocksScript = await fetchPythonScript('/scripts/doc-to-md/mocks.py');
            pyodide.runPython(mocksScript);

            // Fetch & run the converter module (registers convert_lazy globally)
            const converterScript = await fetchPythonScript('/scripts/doc-to-md/converter.py');
            pyodide.runPython(converterScript);

            // Preload strategy: install all format libraries + markitdown upfront
            if (strategy === 'preload') {
                await Promise.all(PRELOAD_PACKAGES.map((pkg) => micropip.install(pkg)));
                await micropip.install('markitdown');
                pyodide.runPython('init_preload()');
            }

            setStatus('ready');
        } catch (err) {
            console.error('Pyodide initialization error:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize Pyodide environment.');
            setStatus('error');
        }
    }, [strategy]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            initPyodide();
        }, 0);
        return () => clearTimeout(timeout);
    }, [initPyodide]);

    const convert = useCallback(async (file: File) => {
        if (!pyodideRef.current || status !== 'ready') return;

        setStatus('converting');
        setError(null);
        setMarkdown(null);

        try {
            const pyodide = pyodideRef.current;
            const ext = file.name.split('.').pop()?.toLowerCase() || '';

            // Lazy strategy: install only the required package on demand
            if (strategy === 'lazy') {
                const dep = EXTENSION_DEPS[ext];
                if (dep) {
                    setStatus('installing_deps');
                    const micropip = pyodide.pyimport('micropip') as MicropipInterface;
                    await micropip.install(dep);
                    setStatus('converting');
                }
            }

            // Write file to Pyodide's virtual filesystem
            const buffer = await file.arrayBuffer();
            const uint8View = new Uint8Array(buffer);
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fsPath = '/tmp/' + sanitizedName;

            try {
                pyodide.FS.mkdir('/tmp');
            } catch {
                // Directory already exists
            }

            pyodide.FS.writeFile(fsPath, uint8View);

            // Call the appropriate Python converter
            let result = '';
            if (strategy === 'preload') {
                const fn = pyodide.runPython('convert_preload') as (fsPath: string) => string;
                result = fn(fsPath);
            } else {
                const fn = pyodide.runPython('convert_lazy') as (fsPath: string, ext: string) => string;
                result = fn(fsPath, ext);
            }

            pyodide.FS.unlink(fsPath);

            setMarkdown(result);
            setStatus('success');
        } catch (err) {
            console.error('Conversion error:', err);
            setError(err instanceof Error ? err.message : 'Failed to convert document.');
            setStatus('error');
        }
    }, [status, strategy]);

    const reset = useCallback(() => {
        if (status === 'success' || status === 'error') {
            setStatus('ready');
            setMarkdown(null);
            setError(null);
        }
    }, [status]);

    return {
        status,
        error,
        markdown,
        convert,
        reset
    };
}
