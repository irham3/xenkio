
import CryptoJS from 'crypto-js';

export type HmacAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SHA224' | 'SHA384' | 'RIPEMD160';
export type OutputFormat = 'Hex' | 'Base64';

export interface HmacResult {
    signature: string;
    error?: string;
}

export function generateHmac(
    message: string,
    secret: string,
    algorithm: HmacAlgorithm,
    format: OutputFormat = 'Hex'
): HmacResult {
    if (!message && !secret) {
        return { signature: '' };
    }

    try {
        let hash;
        switch (algorithm) {
            case 'MD5':
                hash = CryptoJS.HmacMD5(message, secret);
                break;
            case 'SHA1':
                hash = CryptoJS.HmacSHA1(message, secret);
                break;
            case 'SHA256':
                hash = CryptoJS.HmacSHA256(message, secret);
                break;
            case 'SHA512':
                hash = CryptoJS.HmacSHA512(message, secret);
                break;
            case 'SHA224':
                hash = CryptoJS.HmacSHA224(message, secret);
                break;
            case 'SHA384':
                hash = CryptoJS.HmacSHA384(message, secret);
                break;
            case 'RIPEMD160':
                hash = CryptoJS.HmacRIPEMD160(message, secret);
                break;
            default:
                return { signature: '', error: 'Unsupported Algorithm' };
        }

        const signature = format === 'Base64'
            ? hash.toString(CryptoJS.enc.Base64)
            : hash.toString(CryptoJS.enc.Hex);

        return { signature };
    } catch {
        return { signature: '', error: 'Generation Failed' };
    }
}
