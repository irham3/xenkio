import { ChecksumAlgorithm } from '../types';

// Read the file in 8 MB slices so peak RAM usage is bounded regardless of file size.
const CHUNK_SIZE = 8 * 1024 * 1024;

type IncrementalHasher = {
    update: (data: Uint8Array) => void;
    digest: (encoding: 'hex') => string;
};

async function feedChunks(
    file: File,
    hashers: IncrementalHasher[],
    onProgress?: (percent: number) => void,
): Promise<void> {
    const total = file.size;
    let offset = 0;

    while (offset < total) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await chunk.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        for (const h of hashers) h.update(uint8);
        offset += buffer.byteLength;
        onProgress?.(Math.min(100, Math.round((offset / total) * 100)));
    }
}

export async function computeChecksum(
    file: File,
    algorithm: ChecksumAlgorithm,
    onProgress?: (percent: number) => void,
): Promise<string> {
    const hashWasm = await import('hash-wasm');

    let hasher: IncrementalHasher;
    switch (algorithm) {
        case 'MD5':    hasher = await hashWasm.createMD5();    break;
        case 'SHA1':   hasher = await hashWasm.createSHA1();   break;
        case 'SHA256': hasher = await hashWasm.createSHA256(); break;
        case 'SHA512': hasher = await hashWasm.createSHA512(); break;
        case 'CRC32':  hasher = await hashWasm.createCRC32();  break;
        default:       throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    await feedChunks(file, [hasher], onProgress);
    return hasher.digest('hex');
}

export async function computeAllChecksums(
    file: File,
    onProgress?: (percent: number) => void,
): Promise<Record<ChecksumAlgorithm, string>> {
    const { createMD5, createSHA1, createSHA256, createSHA512, createCRC32 } = await import('hash-wasm');

    const [md5h, sha1h, sha256h, sha512h, crc32h] = await Promise.all([
        createMD5(),
        createSHA1(),
        createSHA256(),
        createSHA512(),
        createCRC32(),
    ]);

    await feedChunks(file, [md5h, sha1h, sha256h, sha512h, crc32h], onProgress);

    return {
        MD5:    md5h.digest('hex'),
        SHA1:   sha1h.digest('hex'),
        SHA256: sha256h.digest('hex'),
        SHA512: sha512h.digest('hex'),
        CRC32:  crc32h.digest('hex'),
    };
}

export function formatFileSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
