
export interface WordFile {
    file: File;
    name: string;
    size: number;
    preview?: string;
}

export type ConversionStatus = 'idle' | 'processing' | 'completed' | 'error';
