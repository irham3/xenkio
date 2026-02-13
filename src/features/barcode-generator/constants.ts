import { BarcodeConfig, BarcodeFormat } from './types';

export const DEFAULT_BARCODE_CONFIG: BarcodeConfig = {
    value: '123456789012',
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 16,
    textMargin: 2,
    background: '#ffffff',
    lineColor: '#000000',
};

export const BARCODE_FORMATS: { value: BarcodeFormat; label: string; placeholder: string }[] = [
    { value: 'CODE128', label: 'Code 128', placeholder: 'Any text or number' },
    { value: 'EAN13', label: 'EAN-13', placeholder: '5901234123457' },
    { value: 'UPC', label: 'UPC-A', placeholder: '123456789012' },
    { value: 'CODE39', label: 'Code 39', placeholder: 'HELLO-123' },
    { value: 'ITF14', label: 'ITF-14', placeholder: '12345678901231' },
    { value: 'MSI', label: 'MSI', placeholder: '1234' },
    { value: 'pharmacode', label: 'Pharmacode', placeholder: '1234' },
];
