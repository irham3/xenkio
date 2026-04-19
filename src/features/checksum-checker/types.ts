export type ChecksumAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'CRC32';

export interface ChecksumResult {
    algorithm: ChecksumAlgorithm;
    hash: string;
    verified: boolean | null; // null = not checked
    isLoading: boolean;
    error?: string;
}

export interface ChecksumFileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}
