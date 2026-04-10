export type CompareViewMode = 'ghost' | 'diff' | 'sidebyside';

export type CompareStatus =
    | 'idle'
    | 'loading-a'
    | 'loading-b'
    | 'ready'
    | 'comparing'
    | 'complete'
    | 'error';

export interface PdfInfo {
    file: File;
    numPages: number;
    name: string;
    size: number;
}

export interface RenderedPage {
    pageNumber: number;
    imageData: ImageData;
    width: number;
    height: number;
    dataUrl: string;
}

export interface PageDiffResult {
    pageNumber: number;
    diffPercentage: number;
    diffCount: number;
    totalPixels: number;
    diffDataUrl: string;
}

export interface CompareResult {
    pages: PageDiffResult[];
    totalPages: number;
    maxPages: number;
}
