import CryptoJS from 'crypto-js';
import { chacha20poly1305 } from '@noble/ciphers/chacha';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolution fallback
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolution fallback
import { sha256 } from '@noble/hashes/sha2.js';
import { encryptWithOpenPGP, decryptWithOpenPGP, generateKeyPair } from './openpgp-utils';

interface RC4DropStatic {
    encrypt(message: string | CryptoJS.lib.WordArray, key: string | CryptoJS.lib.WordArray, cfg?: { drop?: number, iv?: CryptoJS.lib.WordArray }): CryptoJS.lib.CipherParams;
    decrypt(ciphertext: string | CryptoJS.lib.CipherParams, key: string | CryptoJS.lib.WordArray, cfg?: { drop?: number, iv?: CryptoJS.lib.WordArray }): CryptoJS.lib.WordArray;
}

type CryptoJSWithRC4Drop = typeof CryptoJS & {
    RC4Drop: RC4DropStatic;
};


export type SymmetricAlgorithm =
    | 'AES'
    | 'DES'
    | 'TripleDES'
    | 'Rabbit'
    | 'RC4'
    | 'RC4Drop'
    | 'ChaCha20'
    | 'Twofish'
    | 'Blowfish'
    | 'Camellia'
    | 'Serpent'
    | 'Cast5';

export type AsymmetricAlgorithm = 'RSA' | 'ECC' | 'ElGamal' | 'DSA' | 'Diffie-Hellman';

export interface EncryptionResult {
    text: string;
    error?: string;
}

// Helper for Base64
const toBase64 = (arr: Uint8Array): string => {
    return btoa(String.fromCharCode(...arr));
};

const fromBase64 = (str: string): Uint8Array => {
    return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
};

// Helper for UTF8
const toBytes = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
};

const fromBytes = (arr: Uint8Array): string => {
    return new TextDecoder().decode(arr);
};

// ChaCha20 Implementation
const encryptChaCha20 = (text: string, secret: string): string => {
    // 1. Salt (16 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 2. Derive Key (32 bytes)
    const key = pbkdf2(sha256, secret, salt, { c: 100000, dkLen: 32 });

    // 3. Nonce (12 bytes)
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    // 4. Encrypt
    const cipher = chacha20poly1305(key, nonce);
    const data = toBytes(text);
    const ciphertext = cipher.encrypt(data);

    // 5. Combine: Salt(16) + Nonce(12) + Ciphertext(variable)
    const combined = new Uint8Array(salt.length + nonce.length + ciphertext.length);
    combined.set(salt, 0);
    combined.set(nonce, salt.length);
    combined.set(ciphertext, salt.length + nonce.length);

    return toBase64(combined);
};

const decryptChaCha20 = (bundle: string, secret: string): string => {
    try {
        const combined = fromBase64(bundle);
        if (combined.length < 28) throw new Error('Invalid ciphertext length');

        const salt = combined.slice(0, 16);
        const nonce = combined.slice(16, 28);
        const ciphertext = combined.slice(28);

        const key = pbkdf2(sha256, secret, salt, { c: 100000, dkLen: 32 });
        const cipher = chacha20poly1305(key, nonce);

        const decrypted = cipher.decrypt(ciphertext);
        return fromBytes(decrypted);
    } catch {
        throw new Error('Decryption failed. Wrong password or corrupted data.');
    }
};

export const encryptText = async (
    text: string,
    algorithm: SymmetricAlgorithm,
    secret: string,
    options?: { drop?: number }
): Promise<EncryptionResult> => {
    try {
        if (!text) return { text: '' };
        if (!secret) return { text: '', error: 'Secret key is required' };

        // Group 1: CryptoJS (Standard, fast, simple output)
        if (['AES', 'DES', 'TripleDES', 'Rabbit', 'RC4', 'RC4Drop'].includes(algorithm)) {
            // BEST PRACTICE: Generate random salt and derive Key/IV using PBKDF2
            // 1. Salt (16 bytes)
            const salt = crypto.getRandomValues(new Uint8Array(16));

            // 2. Determine Key/IV size based on Algo
            let keySize = 256 / 32; // Default 256 bit - CryptoJS expects words (4bytes)
            let ivSize = 128 / 32;  // Default 128 bit

            if (algorithm === 'DES' || algorithm === 'TripleDES') {
                keySize = (algorithm === 'TripleDES' ? 192 : 64) / 32;
                ivSize = 64 / 32;
            }
            if (algorithm === 'Rabbit') { ivSize = 64 / 32; }
            if (algorithm === 'RC4' || algorithm === 'RC4Drop') { ivSize = 0; }

            // 3. Derive Key (using noble/hashes/pbkdf2 for consistency and security)
            // We need bytes for Key + IV
            const requiredBytes = (keySize + ivSize) * 4;
            const derived = pbkdf2(sha256, secret, salt, { c: 100000, dkLen: requiredBytes });

            // 4. Convert to CryptoJS WordArrays
            const derivedWords = CryptoJS.lib.WordArray.create(derived);
            const key = CryptoJS.lib.WordArray.create(derivedWords.words.slice(0, keySize), keySize * 4);
            const iv = ivSize > 0
                ? CryptoJS.lib.WordArray.create(derivedWords.words.slice(keySize, keySize + ivSize), ivSize * 4)
                : undefined;

            let encrypted: CryptoJS.lib.CipherParams | CryptoJS.lib.WordArray;
            const cfg = { iv: iv };

            switch (algorithm) {
                case 'AES': encrypted = CryptoJS.AES.encrypt(text, key, cfg); break;
                // For DES/3DES/Rabbit, we must ensure keys are parsed correctly. 
                // CryptoJS handles WordArray keys as raw keys.
                case 'DES': encrypted = CryptoJS.DES.encrypt(text, key, cfg); break;
                case 'TripleDES': encrypted = CryptoJS.TripleDES.encrypt(text, key, cfg); break;
                case 'Rabbit': encrypted = CryptoJS.Rabbit.encrypt(text, key, cfg); break;
                case 'RC4': encrypted = CryptoJS.RC4.encrypt(text, key, { iv: iv }); break; // RC4 ignores IV
                case 'RC4Drop': {
                    const dropCfg = { iv: iv, drop: options?.drop || 768 };
                    encrypted = (CryptoJS as CryptoJSWithRC4Drop).RC4Drop.encrypt(text, key, dropCfg);
                    break;
                }
                default: throw new Error('Algorithm mishandled');
            }

            // 5. Pack: Salt(16) + Ciphertext
            // Since IV is derived deterministically from Salt + Secret, we don't need to store it.
            // Format: Salt(16) + Ciphertext

            const rawCiphertext = encrypted.ciphertext || encrypted; // Handle if it returned WordArray directly

            // Helper to clean word array to Uint8Array
            const wordArrayToUint8 = (wa: CryptoJS.lib.WordArray) => {
                const words = wa.words;
                const sigBytes = wa.sigBytes;
                const u8 = new Uint8Array(sigBytes);
                for (let i = 0; i < sigBytes; i++) {
                    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                }
                return u8;
            };

            const ctBytes = wordArrayToUint8(rawCiphertext);

            const combined = new Uint8Array(salt.length + ctBytes.length);
            combined.set(salt, 0);
            combined.set(ctBytes, salt.length);

            return { text: toBase64(combined) };
        }

        // Group 2: Modern / Noble (ChaCha20)
        if (algorithm === 'ChaCha20') {
            return { text: encryptChaCha20(text, secret) };
        }

        // Group 3: OpenPGP (Twofish, Blowfish, Camellia, 3DES forced, Cast5)
        // We map our Algo names to OpenPGP config names
        let pgpAlgo: string | undefined;
        if (algorithm === 'Twofish') pgpAlgo = 'twofish';
        if (algorithm === 'Blowfish') pgpAlgo = 'blowfish';
        if (algorithm === 'Camellia') pgpAlgo = 'camellia256';
        if (algorithm === 'Cast5') pgpAlgo = 'cast5';
        // If we wanted to use OpenPGP for AES/3DES we could, but we stick to Group 1 for those unless user specifically asks for PGP format (out of scope for now)

        if (pgpAlgo) {
            return await encryptWithOpenPGP(text, secret, undefined, { symmetricAlgorithm: pgpAlgo });
        }

        // Group 4: Not Supported
        if (algorithm === 'Serpent') {
            return { text: '', error: 'Serpent algorithm is not currently supported in this browser environment.' };
        }

        return { text: '', error: 'Unsupported algorithm' };
    } catch (err) {
        return { text: '', error: (err instanceof Error) ? err.message : 'Encryption failed' };
    }
};

export const decryptText = async (
    ciphertext: string,
    algorithm: SymmetricAlgorithm,
    secret: string,
    options?: { drop?: number }
): Promise<EncryptionResult> => {
    try {
        if (!ciphertext) return { text: '' };
        if (!secret) return { text: '', error: 'Secret key is required' };

        // Determine if it's OpenPGP message (starts with -----BEGIN PGP MESSAGE-----)
        if (ciphertext.trim().startsWith('-----BEGIN PGP MESSAGE-----')) {
            // Must be OpenPGP
            return await decryptWithOpenPGP(ciphertext, secret);
        }

        if (algorithm === 'ChaCha20') {
            return { text: decryptChaCha20(ciphertext, secret) };
        }

        if (algorithm === 'Serpent') {
            return { text: '', error: 'Serpent decryption is not currently supported in this browser environment.' };
        }

        // Default to CryptoJS with custom packing
        try {
            // 1. Unpack
            const combined = fromBase64(ciphertext);
            if (combined.length < 16) throw new Error('Invalid ciphertext length'); // At least salt

            const salt = combined.slice(0, 16);
            const ctBytes = combined.slice(16);

            // 2. Determine sizes again
            let keySize = 256 / 32;
            let ivSize = 128 / 32;

            if (algorithm === 'DES' || algorithm === 'TripleDES') {
                keySize = (algorithm === 'TripleDES' ? 192 : 64) / 32;
                ivSize = 64 / 32;
            }
            if (algorithm === 'Rabbit') { ivSize = 64 / 32; }
            if (algorithm === 'RC4' || algorithm === 'RC4Drop') { ivSize = 0; }

            // 3. Derive Key
            const requiredBytes = (keySize + ivSize) * 4;
            const derived = pbkdf2(sha256, secret, salt, { c: 100000, dkLen: requiredBytes });

            // 4. Convert to CryptoJS
            const derivedWords = CryptoJS.lib.WordArray.create(derived);
            const key = CryptoJS.lib.WordArray.create(derivedWords.words.slice(0, keySize), keySize * 4);
            const iv = ivSize > 0
                ? CryptoJS.lib.WordArray.create(derivedWords.words.slice(keySize, keySize + ivSize), ivSize * 4)
                : undefined;

            // 5. Decrypt
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.lib.WordArray.create(ctBytes)
            });

            let decrypted: CryptoJS.lib.WordArray;

            switch (algorithm) {
                case 'AES': decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv }); break;
                case 'DES': decrypted = CryptoJS.DES.decrypt(cipherParams, key, { iv: iv }); break;
                case 'TripleDES': decrypted = CryptoJS.TripleDES.decrypt(cipherParams, key, { iv: iv }); break;
                case 'Rabbit': decrypted = CryptoJS.Rabbit.decrypt(cipherParams, key, { iv: iv }); break;
                case 'RC4': decrypted = CryptoJS.RC4.decrypt(cipherParams, key, { iv: iv }); break;
                case 'RC4Drop':
                    decrypted = (CryptoJS as CryptoJSWithRC4Drop).RC4Drop.decrypt(cipherParams, key, { drop: options?.drop || 768, iv: iv });
                    break;
                default: throw new Error('Algo not found');
            }

            const utf8 = decrypted.toString(CryptoJS.enc.Utf8);
            if (!utf8) throw new Error('Decryption failed by CryptoJS');
            return { text: utf8 };
        } catch {
            // Fallback for Legacy/Weak KDF formats (Old default behavior)?
            return { text: '', error: 'Decryption failed. Check key and algorithm.' };
        }
    } catch {
        return { text: '', error: 'Decryption failed. Invalid input.' };
    }
};

export { generateKeyPair, encryptWithOpenPGP, decryptWithOpenPGP };
