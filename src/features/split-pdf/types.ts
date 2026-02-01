export interface PdfFile {
    file: File;
    name: string;
    size: number;
    pageCount: number;
    previewUrls: string[]; // Store thumbnail for each page
    arrayBuffer: ArrayBuffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDocument?: any; // Cached pdfjs document
}

export type SplitMode = 'custom' | 'fixed_size';

export interface SplitResult {
    file: Blob;
    name: string;
}

export interface SplitOptions {
    ranges?: string;            // Used for 'custom' mode
    selectedPages?: number[];   // Used for 'custom' mode (legacy/internal)
    mergeOutput?: boolean;      // If true, merge all split results into one file
    splitEachPage?: boolean;    // If true, each page becomes a separate file
    limitSize?: number;         // Used for 'fixed_size' mode (in MB)
    pageOrder?: number[];       // visual order of pages (1-based page numbers from PDF)
}
