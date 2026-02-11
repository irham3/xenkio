import { useState, useCallback } from 'react';
import { CompressionSettings, CompressionResult } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export function usePDFCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<CompressionResult | null>(null);

    const updateSettings = useCallback((updates: Partial<CompressionSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const reset = useCallback(() => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
    }, []);

    return {
        file,
        setFile,
        settings,
        updateSettings,
        isProcessing,
        setIsProcessing,
        result,
        setResult,
        reset
    };
}
