export interface PdfFile {
    file: File;
    name: string;
    size: number;
    pageCount: number;
    arrayBuffer: ArrayBuffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any;
}

export interface CropRect {
    x: number;      // Left offset in points
    y: number;      // Top offset in points
    width: number;  // Crop width in points
    height: number; // Crop height in points
}

export interface PageDimensions {
    width: number;
    height: number;
}

export type CropMode = 'all' | 'individual';
