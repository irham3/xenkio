export type BarcodeFormat =
    | 'CODE128'
    | 'CODE128A'
    | 'CODE128B'
    | 'CODE128C'
    | 'EAN13'
    | 'EAN8'
    | 'UPC'
    | 'CODE39'
    | 'ITF14'
    | 'ITF'
    | 'MSI'
    | 'MSI10'
    | 'MSI11'
    | 'MSI1010'
    | 'MSI1110'
    | 'pharmacode';

export interface BarcodeConfig {
    value: string;
    format: BarcodeFormat;
    width: number;
    height: number;
    displayValue: boolean;
    fontOptions: string; // "bold", "italic", "bold italic", ""
    font: string;
    textAlign: string; // "left", "center", "right"
    textPosition: string; // "bottom", "top"
    textMargin: number;
    fontSize: number;
    background: string;
    lineColor: string;
    margin: number;
}
