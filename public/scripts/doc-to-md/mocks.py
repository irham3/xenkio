"""
Mock modules for native packages incompatible with Pyodide/WebAssembly.

markitdown and its dependencies try to import several native packages
at module load time. These mocks provide the minimum API surface so
that import-time checks pass without error.
"""

import sys
from types import ModuleType


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _noop(*_args, **_kwargs):
    """A no-op callable that accepts anything."""
    return None


def _register(name: str, obj: object) -> None:
    """Register a mock module in sys.modules."""
    sys.modules[name] = obj


# ---------------------------------------------------------------------------
# onnxruntime  (needed by magika → markitdown)
# ---------------------------------------------------------------------------

class _MockOnnxRuntime:
    class InferenceSession:
        pass

_register("onnxruntime", _MockOnnxRuntime())


# ---------------------------------------------------------------------------
# magika  (file-type detection used by markitdown)
# ---------------------------------------------------------------------------

class _MockMagikaOutput:
    ct_label = "unknown"
    label = "unknown"

class _MockMagikaPrediction:
    output = _MockMagikaOutput()

class _MockMagikaResult:
    output = _MockMagikaOutput()
    status = "ok"
    prediction = _MockMagikaPrediction()

class _MockMagika:
    def identify_bytes(self, _b):
        return _MockMagikaResult()

    def identify_paths(self, _p):
        return [_MockMagikaResult()]

    def identify_stream(self, _s):
        return _MockMagikaResult()

class _MockMagikaModule:
    Magika = _MockMagika

_register("magika", _MockMagikaModule())


# ---------------------------------------------------------------------------
# requests  (HTTP client — no network needed in browser conversion)
# ---------------------------------------------------------------------------

class _MockResponse:
    status_code = 200
    text = ""
    headers = {}

    def raise_for_status(self):
        pass

    def json(self):
        return {}

    @property
    def content(self):
        return b""

class _MockSession:
    headers = {}

    def get(self, *a, **kw):    return _MockResponse()
    def post(self, *a, **kw):   return _MockResponse()
    def put(self, *a, **kw):    return _MockResponse()
    def delete(self, *a, **kw): return _MockResponse()
    def head(self, *a, **kw):   return _MockResponse()
    def mount(self, *a, **kw):  pass
    def __enter__(self):        return self
    def __exit__(self, *a):     pass

class _MockExceptions:
    RequestException = Exception
    ConnectionError = Exception
    Timeout = Exception
    HTTPError = Exception

class _MockRequests:
    Response = _MockResponse
    Session = _MockSession
    exceptions = _MockExceptions()

    def get(self, *a, **kw):  return _MockResponse()
    def post(self, *a, **kw): return _MockResponse()
    def put(self, *a, **kw):  return _MockResponse()
    def head(self, *a, **kw): return _MockResponse()

_register("requests", _MockRequests())
_register("requests.exceptions", _MockExceptions())


# ---------------------------------------------------------------------------
# pdfplumber / pypdfium2  (native C deps — cannot compile to WASM)
# ---------------------------------------------------------------------------

class _MockPdfPage:
    chars = []
    images = []
    width = 0
    height = 0

    def extract_text(self):   return ""
    def extract_tables(self): return []
    def extract_words(self):  return []

class _MockPdfPlumber:
    pages = []
    metadata = {}

    def close(self):         pass
    def __enter__(self):     return self
    def __exit__(self, *a):  pass

    @staticmethod
    def open(*_a, **_kw):
        return _MockPdfPlumber()

class _MockPdfPlumberModule:
    def open(self, *a, **kw):
        return _MockPdfPlumber()

_register("pdfplumber", _MockPdfPlumberModule())
_register("pypdfium2", ModuleType("pypdfium2"))
