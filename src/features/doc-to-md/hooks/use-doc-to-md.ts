import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversionStatus, PyodideInterface, LoadingStrategy, MicropipInterface } from '../types';

declare global {
    interface Window {
        loadPyodide: () => Promise<PyodideInterface>;
    }
}

// All Python code as plain strings to avoid template literal corruption
const MOCK_SETUP_SCRIPT = [
    'import sys',
    '',
    'class MockInferenceSession:',
    '    pass',
    'class MockOnnxRuntime:',
    '    InferenceSession = MockInferenceSession',
    "sys.modules['onnxruntime'] = MockOnnxRuntime()",
    '',
    'class MockMagikaOutput:',
    '    ct_label = "unknown"',
    '    label = "unknown"',
    'class MockMagikaPrediction:',
    '    output = MockMagikaOutput()',
    'class MockMagikaResult:',
    '    output = MockMagikaOutput()',
    '    status = "ok"',
    '    prediction = MockMagikaPrediction()',
    'class MockMagika:',
    '    def identify_bytes(self, b): return MockMagikaResult()',
    '    def identify_paths(self, p): return [MockMagikaResult()]',
    '    def identify_stream(self, s): return MockMagikaResult()',
    'class MockMagikaModule:',
    '    Magika = MockMagika',
    "sys.modules['magika'] = MockMagikaModule()",
    '',
    'class MockResponse:',
    '    status_code = 200',
    '    text = ""',
    '    headers = {}',
    '    def raise_for_status(self): pass',
    '    def json(self): return {}',
    '    @property',
    '    def content(self): return b""',
    'class MockSession:',
    '    headers = {}',
    '    def get(self, *args, **kwargs): return MockResponse()',
    '    def post(self, *args, **kwargs): return MockResponse()',
    '    def put(self, *args, **kwargs): return MockResponse()',
    '    def delete(self, *args, **kwargs): return MockResponse()',
    '    def head(self, *args, **kwargs): return MockResponse()',
    '    def mount(self, *args, **kwargs): pass',
    '    def __enter__(self): return self',
    '    def __exit__(self, *args): pass',
    'class MockExceptions:',
    '    RequestException = Exception',
    '    ConnectionError = Exception',
    '    Timeout = Exception',
    '    HTTPError = Exception',
    'class MockRequests:',
    '    Response = MockResponse',
    '    Session = MockSession',
    '    exceptions = MockExceptions()',
    '    def get(self, *args, **kwargs): return MockResponse()',
    '    def post(self, *args, **kwargs): return MockResponse()',
    '    def put(self, *args, **kwargs): return MockResponse()',
    '    def head(self, *args, **kwargs): return MockResponse()',
    "sys.modules['requests'] = MockRequests()",
    "sys.modules['requests.exceptions'] = MockExceptions()",
    '',
    '# Mock pdfplumber (requires native pypdfium2 which cannot run in WASM)',
    'class MockPdfPage:',
    '    chars = []',
    '    images = []',
    '    width = 0',
    '    height = 0',
    '    def extract_text(self): return ""',
    '    def extract_tables(self): return []',
    '    def extract_words(self): return []',
    'class MockPdfPlumber:',
    '    pages = []',
    '    metadata = {}',
    '    def close(self): pass',
    '    def __enter__(self): return self',
    '    def __exit__(self, *args): pass',
    '    @staticmethod',
    '    def open(*args, **kwargs): return MockPdfPlumber()',
    'class MockPdfPlumberModule:',
    '    def open(self, *args, **kwargs): return MockPdfPlumber()',
    "sys.modules['pdfplumber'] = MockPdfPlumberModule()",
    "sys.modules['pypdfium2'] = type(sys)('pypdfium2')",
].join('\n');

const LAZY_PYTHON_SCRIPT = [
    'import sys',
    'import json as json_mod',
    '',
    'def convert_lazy(file_path, file_type):',
    "    if file_type == 'pdf':",
    '        from pdfminer.high_level import extract_text',
    '        return extract_text(file_path)',
    "    elif file_type == 'docx':",
    '        import mammoth',
    '        with open(file_path, "rb") as docx_file:',
    '            result = mammoth.convert_to_markdown(docx_file)',
    '            return result.value',
    "    elif file_type in ('xlsx', 'xls'):",
    '        import openpyxl',
    '        wb = openpyxl.load_workbook(file_path, data_only=True)',
    '        text = []',
    '        for sheet in wb.sheetnames:',
    '            ws = wb[sheet]',
    '            text.append(f"# {sheet}")',
    '            text.append("")',
    '            rows = list(ws.iter_rows(values_only=True))',
    '            if len(rows) > 0:',
    '                header = rows[0]',
    '                text.append("| " + " | ".join([str(c) if c is not None else "" for c in header]) + " |")',
    '                text.append("| " + " | ".join(["---" for _ in header]) + " |")',
    '                for row in rows[1:]:',
    '                    text.append("| " + " | ".join([str(c) if c is not None else "" for c in row]) + " |")',
    '            text.append("")',
    '        return "\\n".join(text)',
    "    elif file_type == 'pptx':",
    '        from pptx import Presentation',
    '        prs = Presentation(file_path)',
    '        text = []',
    '        for i, slide in enumerate(prs.slides):',
    '            text.append(f"## Slide {i+1}")',
    '            text.append("")',
    '            for shape in slide.shapes:',
    '                if hasattr(shape, "text") and shape.text.strip():',
    '                    text.append(shape.text)',
    '            text.append("")',
    '        return "\\n".join(text)',
    "    elif file_type in ('html', 'htm'):",
    '        from bs4 import BeautifulSoup',
    '        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:',
    '            soup = BeautifulSoup(f.read(), "html.parser")',
    '            for tag in soup(["script", "style"]):',
    '                tag.decompose()',
    '            return soup.get_text("\\n", strip=True)',
    "    elif file_type == 'csv':",
    '        import csv',
    '        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:',
    '            reader = csv.reader(f)',
    '            rows = list(reader)',
    '            if len(rows) == 0: return ""',
    '            text = []',
    '            text.append("| " + " | ".join(rows[0]) + " |")',
    '            text.append("| " + " | ".join(["---" for _ in rows[0]]) + " |")',
    '            for row in rows[1:]:',
    '                text.append("| " + " | ".join(row) + " |")',
    '            return "\\n".join(text)',
    "    elif file_type == 'json':",
    '        with open(file_path, "r", encoding="utf-8") as f:',
    '            data = json_mod.load(f)',
    '            return "```json\\n" + json_mod.dumps(data, indent=2) + "\\n```"',
    "    elif file_type == 'rtf':",
    '        from striprtf.striprtf import rtf_to_text',
    '        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:',
    '            return rtf_to_text(f.read())',
    '    else:',
    "        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:",
    '            return f.read()',
].join('\n');

const PRELOAD_SCRIPT = [
    'import importlib',
    'import sys',
    '',
    '# Force remove ALL cached markitdown modules so dependency checks re-run',
    'mods_to_remove = [key for key in sys.modules if "markitdown" in key]',
    'for mod in mods_to_remove:',
    '    del sys.modules[mod]',
    '',
    '# Now reimport markitdown fresh - dependency checks will find our packages',
    'from markitdown import MarkItDown',
    '',
    '# Safety net: force-clear _dependency_exc_info in all converter modules',
    '# in case any check still cached a stale ImportError',
    'import markitdown',
    'for attr_name in dir(markitdown):',
    '    obj = getattr(markitdown, attr_name, None)',
    '    if hasattr(obj, "_dependency_exc_info"):',
    '        obj._dependency_exc_info = None',
    '# Also check the converters subpackage',
    'if hasattr(markitdown, "converters"):',
    '    for attr_name in dir(markitdown.converters):',
    '        obj = getattr(markitdown.converters, attr_name, None)',
    '        if hasattr(obj, "_dependency_exc_info"):',
    '            obj._dependency_exc_info = None',
    '# And patch any converter modules in sys.modules directly',
    'for mod_name, mod_obj in list(sys.modules.items()):',
    '    if "markitdown" in mod_name and hasattr(mod_obj, "_dependency_exc_info"):',
    '        mod_obj._dependency_exc_info = None',
    '',
    'md = MarkItDown()',
    '',
    'def convert_preload(file_path):',
    '    result = md.convert(file_path)',
    '    return result.text_content',
].join('\n');

export function useDocToMd(strategy: LoadingStrategy = 'preload') {
    const [status, setStatus] = useState<ConversionStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [markdown, setMarkdown] = useState<string | null>(null);
    const pyodideRef = useRef<PyodideInterface | null>(null);

    const initPyodide = useCallback(async () => {
        if (pyodideRef.current) return;

        try {
            setStatus('loading_pyodide');

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

            // Mock incompatible native packages
            micropip.add_mock_package('onnxruntime', '1.17.0');
            pyodide.runPython(MOCK_SETUP_SCRIPT);

            // Initialize the custom lazy conversion script globally
            pyodide.runPython(LAZY_PYTHON_SCRIPT);

            // Preload strategy: Install markitdown + all format converters
            if (strategy === 'preload') {
                // Install format-specific libraries FIRST because markitdown
                // checks for them at import time (module-level try/except).
                // If they're not present when markitdown is imported, it caches
                // the failure and won't detect them later.
                await Promise.all([
                    micropip.install('pdfminer.six'),
                    micropip.install('python-docx'),
                    micropip.install('python-pptx'),
                    micropip.install('openpyxl'),
                    micropip.install('mammoth'),
                    micropip.install('beautifulsoup4'),
                    micropip.install('striprtf'),
                ]);
                await micropip.install('markitdown');
                pyodide.runPython(PRELOAD_SCRIPT);
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
            const micropip = pyodide.pyimport('micropip') as MicropipInterface;

            // Get file extension to determine type
            const ext = file.name.split('.').pop()?.toLowerCase() || '';

            // Lazy strategy: Install required packages on demand
            if (strategy === 'lazy') {
                setStatus('installing_deps');
                if (ext === 'pdf') {
                    await micropip.install('pdfminer.six');
                } else if (ext === 'docx') {
                    await micropip.install('mammoth');
                } else if (ext === 'xlsx' || ext === 'xls') {
                    await micropip.install('openpyxl');
                } else if (ext === 'pptx') {
                    await micropip.install('python-pptx');
                } else if (ext === 'html' || ext === 'htm') {
                    await micropip.install('beautifulsoup4');
                } else if (ext === 'rtf') {
                    await micropip.install('striprtf');
                }
                // csv, json, xml, txt, md, log, rst use built-in Python modules
                setStatus('converting');
            }

            const buffer = await file.arrayBuffer();
            const uint8View = new Uint8Array(buffer);

            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fsPath = '/tmp/' + sanitizedName;

            try {
                pyodide.FS.mkdir('/tmp');
            } catch {
                // Ignore if it already exists
            }

            pyodide.FS.writeFile(fsPath, uint8View);

            let result = '';
            if (strategy === 'preload') {
                const convertPreload = pyodide.globals.get('convert_preload');
                result = convertPreload(fsPath);
            } else {
                const convertLazy = pyodide.globals.get('convert_lazy');
                result = convertLazy(fsPath, ext);
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
