export type BarcodeFormat =
    | 'CODE128'
    | 'EAN13'
    | 'UPC'
    | 'CODE39'
    | 'ITF14'
    | 'MSI'
    | 'pharmacode';

export interface BarcodeConfig {
    value: string;
    format: BarcodeFormat;
    width: number;
    height: number;
    displayValue: boolean;
    fontSize: number;
    textMargin: number;
    background: string;
    lineColor: string;
}
