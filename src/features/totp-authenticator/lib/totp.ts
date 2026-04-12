// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolution fallback
import { sha1 } from '@noble/hashes/sha1.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolution fallback
import { sha256, sha512 } from '@noble/hashes/sha2.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolution fallback
import { hmac } from '@noble/hashes/hmac.js';
import type { TotpAlgorithm } from '../types';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function decodeBase32(input: string): Uint8Array {
    const str = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    const bits: number[] = [];

    for (const char of str) {
        const idx = BASE32_CHARS.indexOf(char);
        if (idx === -1) throw new Error(`Invalid base32 character: ${char}`);
        for (let i = 4; i >= 0; i--) {
            bits.push((idx >> i) & 1);
        }
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i * 8 + j];
        }
        bytes[i] = byte;
    }
    return bytes;
}

function counterToBytes(counter: bigint): Uint8Array {
    const buf = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
        buf[i] = Number(c & 0xffn);
        c >>= 8n;
    }
    return buf;
}

function getHashFn(algorithm: TotpAlgorithm) {
    switch (algorithm) {
        case 'SHA256': return sha256;
        case 'SHA512': return sha512;
        default: return sha1;
    }
}

export function generateTotp(
    secret: string,
    algorithm: TotpAlgorithm,
    digits: 6 | 8,
    period: 30,
    timeMs?: number
): string {
    const now = timeMs ?? Date.now();
    const keyBytes = decodeBase32(secret);
    const counter = BigInt(Math.floor(now / 1000 / period));
    const counterBytes = counterToBytes(counter);
    const hashFn = getHashFn(algorithm);
    const hmacResult = hmac(hashFn, keyBytes, counterBytes);
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);
    return String(code % 10 ** digits).padStart(digits, '0');
}

export function getRemainingSeconds(period: number, timeMs?: number): number {
    const now = timeMs ?? Date.now();
    const elapsed = Math.floor(now / 1000) % period;
    return period - elapsed;
}

export function getProgress(period: number, timeMs?: number): number {
    const now = timeMs ?? Date.now();
    const elapsed = Math.floor(now / 1000) % period;
    return elapsed / period;
}
