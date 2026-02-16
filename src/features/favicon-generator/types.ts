
export interface FaviconFile {
    name: string;
    blob: Blob;
    width: number;
    height: number;
    type: 'png' | 'ico' | 'svg';
}

export interface FaviconSettings {
    borderRadius: number;
    padding: number;
    backgroundColor: string;
    includeApple: boolean;
    includeAndroid: boolean;
    includeMS: boolean;
}

export interface FaviconResult {
    files: FaviconFile[];
    zipBlob: Blob | null;
}
