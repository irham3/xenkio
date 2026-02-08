import { useState, useCallback } from 'react';
import { BarcodeConfig, BarcodeFormat } from '../types';

const DEFAULT_CONFIG: BarcodeConfig = {
    value: '1234567890',
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontOptions: '',
    font: 'monospace',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontSize: 20,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10,
};

export function useBarcodeGenerator() {
    const [config, setConfig] = useState<BarcodeConfig>(DEFAULT_CONFIG);

    const updateConfig = useCallback((updates: Partial<BarcodeConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    return {
        config,
        updateConfig,
    };
}
