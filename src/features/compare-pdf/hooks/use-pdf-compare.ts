import { useState, useCallback, useRef } from 'react';
import {
    CompareResult,
    CompareStatus,
    PdfInfo,
    RenderedPage,
} from '../types';
import { loadPdfInfo, renderPdfPage } from '../lib/pdf-renderer';
import { comparePages } from '../lib/pixel-diff';
import { toast } from 'sonner';

const DEFAULT_SCALE = 1.5;

export function usePdfCompare() {
    const [status, setStatus] = useState<CompareStatus>('idle');
    const [pdfA, setPdfA] = useState<PdfInfo | null>(null);
    const [pdfB, setPdfB] = useState<PdfInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [result, setResult] = useState<CompareResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Cache rendered pages to avoid re-rendering on every page switch
    const pagesACache = useRef<Map<number, RenderedPage>>(new Map());
    const pagesBCache = useRef<Map<number, RenderedPage>>(new Map());

    const loadPdf = useCallback(
        async (file: File, side: 'a' | 'b') => {
            setError(null);
            setStatus(side === 'a' ? 'loading-a' : 'loading-b');
            // Reset the cache for the replaced PDF
            if (side === 'a') {
                pagesACache.current.clear();
            } else {
                pagesBCache.current.clear();
            }
            try {
                const info = await loadPdfInfo(file);
                if (side === 'a') {
                    setPdfA(info);
                } else {
                    setPdfB(info);
                }
                setStatus('ready');
                setResult(null);
                setCurrentPage(1);
            } catch (err) {
                const msg =
                    err instanceof Error ? err.message : 'Failed to load PDF';
                setError(msg);
                setStatus('error');
                toast.error(`Failed to load PDF: ${msg}`);
            }
        },
        []
    );

    const clearPdf = useCallback((side: 'a' | 'b') => {
        if (side === 'a') {
            setPdfA(null);
            pagesACache.current.clear();
        } else {
            setPdfB(null);
            pagesBCache.current.clear();
        }
        setResult(null);
        setStatus('idle');
        setCurrentPage(1);
    }, []);

    const compare = useCallback(async () => {
        if (!pdfA || !pdfB) return;
        setStatus('comparing');
        setProgress(0);
        setError(null);

        try {
            const maxPages = Math.min(pdfA.numPages, pdfB.numPages);
            const pages = [];

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                let renderedA = pagesACache.current.get(pageNum);
                if (!renderedA) {
                    renderedA = await renderPdfPage(pdfA.file, pageNum, DEFAULT_SCALE);
                    pagesACache.current.set(pageNum, renderedA);
                }

                let renderedB = pagesBCache.current.get(pageNum);
                if (!renderedB) {
                    renderedB = await renderPdfPage(pdfB.file, pageNum, DEFAULT_SCALE);
                    pagesBCache.current.set(pageNum, renderedB);
                }

                const diffResult = comparePages(renderedA, renderedB);
                pages.push(diffResult);
                setProgress(Math.round((pageNum / maxPages) * 100));
            }

            setResult({
                pages,
                totalPages: maxPages,
            });
            setCurrentPage(1);
            setStatus('complete');
            toast.success(`Comparison complete — ${maxPages} page${maxPages !== 1 ? 's' : ''} analysed`);
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : 'Comparison failed';
            setError(msg);
            setStatus('error');
            toast.error(`Comparison failed: ${msg}`);
        }
    }, [pdfA, pdfB]);

    const getRenderedPage = useCallback(
        async (side: 'a' | 'b', pageNum: number): Promise<RenderedPage | null> => {
            const info = side === 'a' ? pdfA : pdfB;
            if (!info) return null;
            const cache = side === 'a' ? pagesACache.current : pagesBCache.current;
            let rendered = cache.get(pageNum);
            if (!rendered) {
                rendered = await renderPdfPage(info.file, pageNum, DEFAULT_SCALE);
                cache.set(pageNum, rendered);
            }
            return rendered;
        },
        [pdfA, pdfB]
    );

    const reset = useCallback(() => {
        setPdfA(null);
        setPdfB(null);
        setResult(null);
        setStatus('idle');
        setError(null);
        setProgress(0);
        setCurrentPage(1);
        pagesACache.current.clear();
        pagesBCache.current.clear();
    }, []);

    const maxPages =
        pdfA && pdfB ? Math.min(pdfA.numPages, pdfB.numPages) : 0;

    return {
        status,
        pdfA,
        pdfB,
        currentPage,
        setCurrentPage,
        result,
        error,
        progress,
        maxPages,
        loadPdf,
        clearPdf,
        compare,
        getRenderedPage,
        reset,
    };
}
