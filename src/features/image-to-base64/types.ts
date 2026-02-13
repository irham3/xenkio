
export interface ImageToBase64Options {
    image?: File;
    includeMimeType: boolean;
}

export interface ImageToBase64Result {
    base64: string;
    dataUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dimensions?: {
        width: number;
        height: number;
    };
}
