export interface OCRWord {
    text: string;
    x0: number;
    top: number;
    x1: number;
    bottom: number;
    size: number;
}

export async function extractOcrWordsFromPdf(
    fileUrl: string, 
    onProgress?: (progress: number) => void
): Promise<Record<number, OCRWord[]>> {
    
    // Dynamically import libraries to prevent SSR crashes (DOMMatrix is not defined)
    const { createWorker } = await import('tesseract.js');
    const pdfjsLib = await import('pdfjs-dist');
    
    // Ensure the worker is configured
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    
    onProgress?.(0);
    
    // 1. Load PDF
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    // 2. Initialize Tesseract Worker
    const worker = await createWorker('ind+eng');
    
    const allWords: Record<number, OCRWord[]> = {};

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Render to canvas at scale 1.0 (1 pixel = 1 PDF point)
        // However, scale 1.0 might be too low resolution for good OCR.
        // Let's render at scale 2.0 and then divide coordinates by 2.0.
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvas: canvas,
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Run OCR
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await worker.recognize(dataUrl) as { data: any };
        
        const pageWords: OCRWord[] = [];
        
        if (data && data.words) {
            for (const w of data.words) {
                // Ignore empty or whitespace-only words
                if (!w.text.trim()) continue;
                
                pageWords.push({
                    text: w.text,
                    x0: w.bbox.x0 / scale,
                    top: w.bbox.y0 / scale,
                    x1: w.bbox.x1 / scale,
                    bottom: w.bbox.y1 / scale,
                    size: (w.font_size ? w.font_size : 12) / scale
                });
            }
        }
        
        allWords[pageNum - 1] = pageWords; // 0-indexed for python compatibility
        
        onProgress?.((pageNum / numPages) * 100);
    }
    
    await worker.terminate();
    
    return allWords;
}
