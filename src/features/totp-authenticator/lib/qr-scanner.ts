import jsQR from 'jsqr';
import { parseOtpauthUri } from './export-import';
import type { TotpAccount } from '../types';

export async function scanQrFromFile(file: File): Promise<Omit<TotpAccount, 'id'>> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Could not create canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (!code) {
                reject(new Error('No QR code found in the image'));
                return;
            }
            const account = parseOtpauthUri(code.data);
            if (!account) {
                reject(new Error('QR code does not contain a valid otpauth:// URI'));
                return;
            }
            resolve(account);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}
