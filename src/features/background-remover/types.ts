export interface ProcessedImage {
    id: string;
    originalFile: File;
    originalUrl: string;
    resultUrl: string | null;
    resultBlob: Blob | null;
    status: 'idle' | 'processing' | 'done' | 'error';
    error?: string;
}

export interface ModelStatus {
    isLoading: boolean;
    isReady: boolean;
    progress: number;
    error: string | null;
}
