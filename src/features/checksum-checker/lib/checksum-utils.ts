import { ChecksumAlgorithm } from '../types';

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function computeChecksum(file: File, algorithm: ChecksumAlgorithm): Promise<string> {
    const buffer = await readFileAsArrayBuffer(file);

    switch (algorithm) {
        case 'SHA1': {
            const digest = await crypto.subtle.digest('SHA-1', buffer);
            return bufferToHex(digest);
        }
        case 'SHA256': {
            const digest = await crypto.subtle.digest('SHA-256', buffer);
            return bufferToHex(digest);
        }
        case 'SHA512': {
            const digest = await crypto.subtle.digest('SHA-512', buffer);
            return bufferToHex(digest);
        }
        case 'MD5': {
            const { createMD5 } = await import('hash-wasm');
            const hasher = await createMD5();
            hasher.update(new Uint8Array(buffer));
            return hasher.digest('hex');
        }
        case 'CRC32': {
            const { createCRC32 } = await import('hash-wasm');
            const hasher = await createCRC32();
            hasher.update(new Uint8Array(buffer));
            return hasher.digest('hex');
        }
        default:
            throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
}

export async function computeAllChecksums(file: File): Promise<Record<ChecksumAlgorithm, string>> {
    const buffer = await readFileAsArrayBuffer(file);
    const uint8 = new Uint8Array(buffer);

    const [sha1, sha256, sha512, md5, crc32] = await Promise.all([
        crypto.subtle.digest('SHA-1', buffer).then(bufferToHex),
        crypto.subtle.digest('SHA-256', buffer).then(bufferToHex),
        crypto.subtle.digest('SHA-512', buffer).then(bufferToHex),
        import('hash-wasm').then(async ({ createMD5 }) => {
            const h = await createMD5();
            h.update(uint8);
            return h.digest('hex');
        }),
        import('hash-wasm').then(async ({ createCRC32 }) => {
            const h = await createCRC32();
            h.update(uint8);
            return h.digest('hex');
        }),
    ]);

    return { MD5: md5, SHA1: sha1, SHA256: sha256, SHA512: sha512, CRC32: crc32 };
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
