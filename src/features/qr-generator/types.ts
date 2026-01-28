
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
        x?: number;
        y?: number;
        opacity?: number;
        borderRadius?: number;
        borderSize?: number;
        borderColor?: string;
    };
    dotStyle: 'square' | 'rounded' | 'dots';
    cornerStyle: 'square' | 'rounded' | 'extra-rounded';
    cornerColor?: string;
    cornerDotColor?: string;
    gradient?: {
        enabled: boolean;
        startColor: string;
        endColor: string;
        rotation: number;
    };
    frame?: {
        style: 'none' | 'simple' | 'modern' | 'badge';
        text: string;
        color: string;
    };
}

export interface QRGeneratedData {
    dataUrl: string;
    blob: Blob;
}
