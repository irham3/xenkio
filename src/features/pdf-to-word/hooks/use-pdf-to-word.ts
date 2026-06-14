import { useState, useCallback, useRef, useEffect } from 'react'
import {
    PdfFile,
    ConversionResult,
    ConversionStatus,
    PyodideInterface,
    MicropipInterface
} from '../types'
import { extractOcrWordsFromPdf } from '../utils/ocr'

/** Fetch a Python script from /public/scripts/ and return its text. */
async function fetchPythonScript(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
    }
    return response.text();
}

export function usePdfToWord() {
    const [status, setStatus] = useState<ConversionStatus>('idle')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<ConversionResult | null>(null)
    
    const pyodideRef = useRef<PyodideInterface | null>(null);

    const initPyodide = useCallback(async () => {
        if (pyodideRef.current) return;

        try {
            setStatus('loading_pyodide');

            if (!(window as unknown as { loadPyodide: unknown }).loadPyodide) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                    document.body.appendChild(script);
                });
            }

            const pyodide = await (window as unknown as { loadPyodide: () => Promise<PyodideInterface> }).loadPyodide();
            pyodideRef.current = pyodide;

            setStatus('installing_deps');
            await pyodide.loadPackage('micropip');
            const micropip = pyodide.pyimport('micropip') as MicropipInterface;

            // Install dependencies manually, avoiding pypdfium2 which lacks a Wasm wheel
            await micropip.install(['pdfminer.six', 'Pillow', 'python-docx', 'pypdf']);
            // Install pdfplumber without its dependencies
            await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('pdfplumber', deps=False)
            `);

            // Fetch & run the converter module
            const converterScript = await fetchPythonScript('/scripts/pdf-to-word/converter.py');
            pyodide.runPython(converterScript);

            setStatus('ready');
        } catch (err) {
            console.error('Pyodide initialization error:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize Pyodide environment.');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            initPyodide();
        }, 0);
        return () => clearTimeout(timer);
    }, [initPyodide]);

    const convertToWord = useCallback(async (pdfFile: PdfFile, enableOcr: boolean = false): Promise<void> => {
        if (!pyodideRef.current) {
            setError("Python environment is not ready.");
            setStatus('error');
            return;
        }

        setStatus('processing');
        setProgress(20);
        setError(null);
        setResult(null);

        const pyodide = pyodideRef.current;
        const inputPath = '/tmp/' + pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const outputPath = inputPath.replace(/\.pdf$/i, '.docx');

        try {
            // Write PDF file to virtual filesystem
            const uint8Array = new Uint8Array(pdfFile.arrayBuffer);
            pyodide.FS.writeFile(inputPath, uint8Array);

            if (enableOcr) {
                setStatus('processing');
                setProgress(10);
                
                try {
                    // Blob URL for pdf.js to read
                    const blob = new Blob([uint8Array], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    const ocrWords = await extractOcrWordsFromPdf(blobUrl, (p) => {
                        setProgress(10 + p * 0.4); // 10% to 50%
                    });
                    URL.revokeObjectURL(blobUrl);
                    
                    // Expose to window for Pyodide
                    (window as any).ocrWordsJson = JSON.stringify(ocrWords);
                } catch (err) {
                    console.error("OCR Failed:", err);
                    (window as any).ocrWordsJson = "{}";
                }
            } else {
                (window as any).ocrWordsJson = "{}";
                setProgress(50);
            }

            // Run conversion (async to avoid blocking UI)
            const resultStr = await pyodide.runPythonAsync(`
                import js
                import json
                
                ocr_words = json.loads(js.window.ocrWordsJson)
                convert_pdf_to_word('${inputPath}', '${outputPath}', ocr_words)
            `) as string;

            setProgress(80);

            // Read the output docx
            const outputData = pyodide.FS.readFile(outputPath);
            const blob = new Blob([outputData as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            // Clean up virtual filesystem
            try { pyodide.FS.unlink(inputPath); } catch {}
            try { pyodide.FS.unlink(outputPath); } catch {}

            let wordCount = 0;
            if (resultStr && !isNaN(parseInt(resultStr))) {
                wordCount = parseInt(resultStr);
            }

            setResult({
                blob,
                fileName: pdfFile.name.replace(/\.pdf$/i, '') + '.docx',
                pageCount: pdfFile.pageCount,
                wordCount
            });

            setProgress(100);
            setStatus('completed');
        } catch (err: unknown) {
            console.error('Conversion error:', err);
            setError(err instanceof Error ? err.message : 'Conversion failed');
            setStatus('error');
            
            // Clean up on error
            try { pyodide.FS.unlink(inputPath); } catch {}
            try { pyodide.FS.unlink(outputPath); } catch {}
        }
    }, []);

    const downloadResult = useCallback(async () => {
        if (!result) return;
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        a.click();
        URL.revokeObjectURL(url);
    }, [result]);

    const reset = useCallback(() => {
        setStatus('ready');
        setProgress(0);
        setError(null);
        setResult(null);
    }, []);

    return {
        convertToWord,
        downloadResult,
        status,
        progress,
        error,
        result,
        reset
    };
}
