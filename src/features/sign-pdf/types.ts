
export interface PDFSignature {
    id: string;
    dataUrl: string; // Base64 image
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
    type: 'draw' | 'type' | 'upload' | 'mobile';
}

export type SignMode = 'draw' | 'type' | 'upload' | 'mobile';

export interface PDFFile {
    file: File;
    name: string;
    size: number;
    totalPages: number;
    previewUrls: string[]; // Generated preview images of pages
}

export interface SignPdfState {
    file: PDFFile | null;
    signatures: PDFSignature[];
    currentSignature: PDFSignature | null;
    currentPageIndex: number;
    isProcessing: boolean;
    activeMode: SignMode;
    editingSignatureId: string | null;
    error: string | null;
}
