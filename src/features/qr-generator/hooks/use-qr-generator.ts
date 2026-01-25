
import { useState } from 'react';
import { QRConfig } from '../types';
import { DEFAULT_QR_CONFIG } from '../constants';

export function useQrGenerator() {
    const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);

    const updateConfig = (updates: Partial<QRConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    const downloadQr = (format: 'png' | 'svg' | 'pdf') => {
        // Phase 1: Dummy download functionality
        console.log(`Downloading QR code as ${format}...`);
        alert(`Download ${format.toUpperCase()} functionality coming soon!`);
    };

    return {
        config,
        updateConfig,
        downloadQr,
    };
}
