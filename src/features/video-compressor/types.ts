export interface CompressionSettings {
    /** Compression ratio: 0.3 = 30% of original size, 0.7 = 70%. */
    ratio: number;
    /** Output resolution: 'original' | '1080' | '720' | '480' | '360' | '240' | '144' */
    resolution: string;
    /** Audio handling: 'copy' = keep original, 'compress' = re-encode, 'remove' = strip audio */
    audioMode: 'copy' | 'compress' | 'remove';
    /** Audio bitrate in kbps (when re-encoding). */
    audioBitrate: number;
}

export interface CompressionResult {
    url: string;
    size: number;
    blob: Blob;
    fileName: string;
    timeTaken: number;
}
