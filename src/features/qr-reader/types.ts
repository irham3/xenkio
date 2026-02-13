
export interface QrReaderResult {
    data: string;
    type: string; // 'image' | 'camera'
    timestamp: number;
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
}

export interface QrReaderOptions {
    continuousScan: boolean;
}
