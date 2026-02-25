/**
 * Centralized pdfjs worker setup.
 * Uses a local copy of the worker from /public instead of fetching from unpkg.com,
 * enabling full offline support for all PDF tools.
 *
 * Uses dynamic import to avoid SSR issues (DOMMatrix is browser-only).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsModule: any = null;
let initPromise: Promise<void> | null = null;

/**
 * Lazily initializes pdfjs-dist with the local worker.
 * Safe to call multiple times — only initializes once.
 * Must be awaited before using the returned module.
 */
export async function getPdfjs() {
    if (pdfjsModule) return pdfjsModule;

    if (!initPromise) {
        initPromise = (async () => {
            const lib = await import('pdfjs-dist');
            lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            pdfjsModule = lib;
        })();
    }

    await initPromise;
    return pdfjsModule;
}
