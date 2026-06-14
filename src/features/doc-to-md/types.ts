export interface DocFile {
    file: File;
    name: string;
    size: number;
}

export type ConversionStatus = 'idle' | 'loading_pyodide' | 'installing_deps' | 'ready' | 'converting' | 'success' | 'error';

export type LoadingStrategy = 'preload' | 'lazy';

export interface PyodideInterface {
    loadPackage: (names: string | string[]) => Promise<void>;
    pyimport: (name: string) => unknown;
    runPython: (code: string) => unknown;
    FS: {
        writeFile: (path: string, data: Uint8Array | string) => void;
        readFile: (path: string, opts?: { encoding: string }) => unknown;
        unlink: (path: string) => void;
        mkdir: (path: string) => void;
    };
    globals: {
        get: (name: string) => (...args: string[]) => string;
    };
}

export interface MicropipInterface {
    install: (pkg: string | string[]) => Promise<void>;
    add_mock_package: (name: string, version: string) => void;
}
