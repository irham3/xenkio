import { useState, useCallback } from 'react';
import { ConversionOptions, ConversionResult, ConversionStatus } from '../types';
import { convertPdfToImages } from '../lib/pdf-image-converter';
import { toast } from 'sonner';

export function usePdfToImage() {
    const [status, setStatus] = useState<ConversionStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ConversionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const convert = useCallback(async (file: File, options: ConversionOptions) => {
        setStatus('processing');
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            const result = await convertPdfToImages(file, options, (p) => setProgress(p));
            setResult(result);
            setStatus('completed');
            toast.success('PDF converted to images successfully!');
        } catch (err) {
            console.error('Conversion failed:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStatus('error');
            toast.error('Failed to convert PDF. Please try again.');
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setProgress(0);
        setResult(null);
        setError(null);
    }, []);

    return {
        convert,
        reset,
        status,
        progress,
        result,
        error
    };
}
