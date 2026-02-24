import * as pdfjsLib from 'pdfjs-dist';

let workerInitialized = false;

/**
 * Sets up the pdfjs worker using the local copy in /public.
 * This ensures PDF tools work fully offline without fetching from unpkg.com.
 * 
 * Call this once before any pdfjs operation. Safe to call multiple times.
 */
export function setupPdfWorker(): void {
    if (workerInitialized) return;

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerInitialized = true;
}

export { pdfjsLib };
