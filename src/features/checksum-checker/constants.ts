import { ChecksumAlgorithm } from './types';

export const CHECKSUM_ALGORITHMS: {
    id: ChecksumAlgorithm;
    name: string;
    bits: number;
    description: string;
}[] = [
    { id: 'MD5', name: 'MD5', bits: 128, description: '128-bit. Fast, widely used for file integrity (not for security).' },
    { id: 'SHA1', name: 'SHA-1', bits: 160, description: '160-bit. Common in older software distributions.' },
    { id: 'SHA256', name: 'SHA-256', bits: 256, description: '256-bit. Industry standard for secure file verification.' },
    { id: 'SHA512', name: 'SHA-512', bits: 512, description: '512-bit. Higher security margin, used in enterprise software.' },
    { id: 'CRC32', name: 'CRC32', bits: 32, description: '32-bit. Fast cyclic redundancy check for error detection.' },
];
