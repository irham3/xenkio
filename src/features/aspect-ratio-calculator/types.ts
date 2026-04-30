export interface AspectRatioResult {
    ratio: string;
    gcd: number;
    widthPart: number;
    heightPart: number;
    decimal: number;
    orientation: 'landscape' | 'portrait' | 'square';
    commonMatch: string | null;
}

export type AspectRatioMode = 'calculate' | 'scale';
