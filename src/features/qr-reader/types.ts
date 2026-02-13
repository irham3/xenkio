
export interface QrReaderState {
    result: string | null;
    imagePreview: string | null;
    isProcessing: boolean;
    error: string | null;
}

export interface QrReaderResult {
    text: string;
    isUrl: boolean;
}
