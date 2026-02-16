export interface CompressionSettings {
    /** CRF value (0-51). Lower = better quality, bigger file. Default 28. */
    crf: number;
    /** Encoding preset. Affects speed vs compression ratio. */
    preset: string;
    /** Output resolution: 'original' | '1080' | '720' | '480' | '360' */
    resolution: string;
}

export interface CompressionResult {
    url: string;
    size: number;
    blob: Blob;
    fileName: string;
    timeTaken: number;
}
