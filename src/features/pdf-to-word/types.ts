export interface PdfFile {
    file: File;
    name: string;
    size: number;
    pageCount: number;
    arrayBuffer: ArrayBuffer;
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

export interface TextSpan {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
    color: RGBColor;
}

export interface TextLine {
    spans: TextSpan[];
    x: number;
    y: number;
    width: number;
    height: number;
    bbox: BoundingBox;
}

export interface TextBlock {
    lines: TextLine[];
    bbox: BoundingBox;
    isTable: boolean;
}

export interface BoundingBox {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface PageLayout {
    width: number;
    height: number;
    blocks: TextBlock[];
    columns: number;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
}

export interface TableCell {
    text: string;
    spans: TextSpan[];
    rowSpan: number;
    colSpan: number;
    bbox: BoundingBox;
}

export interface TableRow {
    cells: TableCell[];
    y: number;
    height: number;
}

export interface DetectedTable {
    rows: TableRow[];
    bbox: BoundingBox;
    columnWidths: number[];
}

export interface ConversionResult {
    blob: Blob;
    fileName: string;
    pageCount: number;
    wordCount: number;
}

export type ConversionStatus = 'idle' | 'loading' | 'processing' | 'completed' | 'error';

// Helper functions
export function rgbToHex(color: RGBColor): string {
    const toHex = (n: number): string => {
        const hex = Math.round(n * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function isBlackColor(color: RGBColor): boolean {
    return color.r < 0.1 && color.g < 0.1 && color.b < 0.1;
}

export function bboxOverlap(a: BoundingBox, b: BoundingBox): boolean {
    return !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);
}

export function bboxContains(outer: BoundingBox, inner: BoundingBox): boolean {
    return outer.x0 <= inner.x0 && outer.x1 >= inner.x1 &&
        outer.y0 <= inner.y0 && outer.y1 >= inner.y1;
}

export function bboxWidth(bbox: BoundingBox): number {
    return bbox.x1 - bbox.x0;
}

export function bboxHeight(bbox: BoundingBox): number {
    return bbox.y1 - bbox.y0;
}

export function mergeBbox(a: BoundingBox, b: BoundingBox): BoundingBox {
    return {
        x0: Math.min(a.x0, b.x0),
        y0: Math.min(a.y0, b.y0),
        x1: Math.max(a.x1, b.x1),
        y1: Math.max(a.y1, b.y1)
    };
}
