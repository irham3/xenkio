
export interface ZipFileEntry {
    name: string;
    size: number;
    isDirectory: boolean;
    path: string;
    blob?: Blob;
}

export interface ZipExtractorState {
    files: ZipFileEntry[];
    zipName: string;
    isExtracting: boolean;
    error: string | null;
}
