
import { useState, useCallback } from 'react';
import { QrReaderResult } from '../types';
import { decodeQrFromImage } from '../lib/qr-utils';

export function useQrReader() {
    const [result, setResult] = useState<QrReaderResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scanImage = useCallback(async (file: File) => {
        setIsScanning(true);
        setError(null);
        try {
            const data = await decodeQrFromImage(file);
            if (data) {
                const imageUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                setResult({
                    data,
                    type: 'image',
                    timestamp: Date.now(),
                    imageUrl,
                    fileName: file.name,
                    fileSize: file.size
                });
            } else {
                setError('No QR code found in this image. Please try another one.');
            }
        } catch (err) {
            console.error('QR Scan error:', err);
            setError('Failed to process image. Please make sure it is a valid image file.');
        } finally {
            setIsScanning(false);
        }
    }, []);

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return {
        result,
        isScanning,
        error,
        scanImage,
        clearResult,
        setResult
    };
}
