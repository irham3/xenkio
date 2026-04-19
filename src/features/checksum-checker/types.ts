export type ChecksumAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'CRC32';

/** Fast: loads the whole file into RAM at once for maximum speed.
 *  Efficient: reads 8 MB at a time — low RAM, shows live progress. */
export type HashingMode = 'fast' | 'efficient';

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
