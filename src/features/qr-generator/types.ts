
export interface QRConfig {
    value: string;
    size: number;
    fgColor: string;
    bgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
    includeMargin: boolean;
    imageSettings?: {
        src: string;
        height: number;
        width: number;
        excavate: boolean;
    };
}

export interface QRGeneratedData {
    dataUrl: string;
    blob: Blob;
}
