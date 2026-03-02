'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { loadPdf } from '../lib/pdf-renderer';

interface UsePdfReaderReturn {
    file: File | null;
    pdfDoc: PDFDocumentProxy | null;
    currentPage: number;
    totalPages: number;
    zoom: number;
    isLoading: boolean;
    error: string | null;
    handleFileUpload: (file: File) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    setZoom: (zoom: number) => void;
    resetReader: () => void;
}

export function usePdfReader(): UsePdfReaderReturn {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoomState] = useState(1.2);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

    const handleFileUpload = useCallback(async (uploadedFile: File) => {
        if (uploadedFile.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setFile(uploadedFile);

        try {
            if (pdfDocRef.current) {
                pdfDocRef.current.destroy();
            }
            const doc = await loadPdf(uploadedFile);
            pdfDocRef.current = doc;
            setPdfDoc(doc);
            setTotalPages(doc.numPages);
            setCurrentPage(1);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load PDF';
            setError(message);
            setPdfDoc(null);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const nextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToPage = useCallback(
        (page: number) => {
            const clamped = Math.max(1, Math.min(page, totalPages));
            setCurrentPage(clamped);
        },
        [totalPages]
    );

    const setZoom = useCallback((newZoom: number) => {
        setZoomState(Math.max(0.5, Math.min(3, newZoom)));
    }, []);

    const resetReader = useCallback(() => {
        if (pdfDocRef.current) {
            pdfDocRef.current.destroy();
            pdfDocRef.current = null;
        }
        setFile(null);
        setPdfDoc(null);
        setCurrentPage(1);
        setTotalPages(0);
        setZoomState(1.2);
        setError(null);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (!pdfDoc) return;

        function handleKeyDown(e: KeyboardEvent): void {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCurrentPage((prev) => Math.max(prev - 1, 1));
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pdfDoc, totalPages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pdfDocRef.current) {
                pdfDocRef.current.destroy();
            }
        };
    }, []);

    return {
        file,
        pdfDoc,
        currentPage,
        totalPages,
        zoom,
        isLoading,
        error,
        handleFileUpload,
        nextPage,
        prevPage,
        goToPage,
        setZoom,
        resetReader,
    };
}
