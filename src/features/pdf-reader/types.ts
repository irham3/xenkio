import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface PdfReaderState {
    file: File | null;
    pdfDoc: PDFDocumentProxy | null;
    currentPage: number;
    totalPages: number;
    zoom: number;
    isLoading: boolean;
    error: string | null;
}

export type GestureDirection = 'left' | 'right' | 'none';

export interface SwipeState {
    startX: number;
    currentX: number;
    isTracking: boolean;
    lastTriggerTime: number;
}

export interface GestureControlState {
    isActive: boolean;
    isModelLoading: boolean;
    gestureDirection: GestureDirection;
    error: string | null;
}

export interface HandLandmark {
    x: number;
    y: number;
    z: number;
}
