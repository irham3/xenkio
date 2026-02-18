
import { useState, useCallback } from 'react';
import { PDFSignature, SignMode, SignPdfState } from '../types';
import { renderPdfPages, embedSignature } from '../lib/pdf-utils';
import { MAX_PDF_SIZE } from '../constants';

export function useSignPdf() {
    const [state, setState] = useState<SignPdfState>({
        file: null,
        signatures: [],
        currentSignature: null,
        currentPageIndex: 0,
        isProcessing: false,
        activeMode: 'draw',
        editingSignatureId: null,
        error: null,
    });

    const handleFileSelect = useCallback(async (file: File) => {
        if (file.size > MAX_PDF_SIZE) {
            setState(prev => ({ ...prev, error: 'File size exceeds 20MB limit.' }));
            return;
        }

        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            const previewUrls = await renderPdfPages(file);
            setState(prev => ({
                ...prev,
                file: {
                    file,
                    name: file.name,
                    size: file.size,
                    totalPages: previewUrls.length,
                    previewUrls,
                },
                isProcessing: false,
            }));
        } catch (err) {
            console.error(err);
            setState(prev => ({ ...prev, error: 'Failed to process PDF file.', isProcessing: false }));
        }
    }, []);

    const addSignature = useCallback((signature: PDFSignature) => {
        setState(prev => ({
            ...prev,
            signatures: [...prev.signatures, signature],
            currentSignature: signature, // Automatically select newly added signature
        }));
    }, []);

    const updateSignaturePosition = useCallback((id: string, x: number, y: number) => {
        setState(prev => ({
            ...prev,
            signatures: prev.signatures.map(sig =>
                sig.id === id ? { ...sig, x, y } : sig
            ),
        }));
    }, []);

    const removeSignature = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            signatures: prev.signatures.filter(sig => sig.id !== id),
            currentSignature: prev.currentSignature?.id === id ? null : prev.currentSignature,
        }));
    }, []);

    const selectSignature = useCallback((id: string | null) => {
        setState(prev => ({
            ...prev,
            currentSignature: id ? prev.signatures.find(s => s.id === id) || null : null,
        }));
    }, []);

    const setPage = useCallback((index: number) => {
        setState(prev => ({ ...prev, currentPageIndex: index }));
    }, []);

    const setMode = useCallback((mode: SignMode) => {
        setState(prev => ({ ...prev, activeMode: mode }));
    }, []);

    const generateSignedPdf = useCallback(async () => {
        if (!state.file) return null;

        setState(prev => ({ ...prev, isProcessing: true }));
        try {
            // Logic to actually embed signatures into PDF bytes
            // Coordinates need to be passed correctly from UI state (DOM coordinates) to PDF coords
            // We assume signatures state currently holds DOM coordinates relative to the page preview
            // The embedSignature function should handle Y-flipping if needed, but scaling from CSS pixels to PDF points is critical.
            // Usually PDF Points = 72 DPI, but browser CSS pixels depend on scaling.
            // For simplicity, we assume 1:1 scaling if we render canvas heavily scaled or rely on standard PDF sizing.

            // Let's verify scaling strategy:
            // When rendering preview, we get width/height of viewport. 
            // If we render at scale 1.5, the image is 1.5x larger than default PDF points.
            // Signatures placed on this image need to be scaled down by 1.5 to match PDF points.

            const scaleFactor = 1.5; // Matches renderPdfPages scale

            const adjustedSignatures = state.signatures.map(sig => ({
                ...sig,
                x: sig.x / scaleFactor,
                y: sig.y / scaleFactor,
                width: sig.width / scaleFactor,
                height: sig.height / scaleFactor,
            }));

            const pdfBytes = await embedSignature(state.file.file, adjustedSignatures);

            setState(prev => ({ ...prev, isProcessing: false }));
            return pdfBytes;
        } catch (err) {
            console.error(err);
            setState(prev => ({ ...prev, error: 'Failed to sign PDF.', isProcessing: false }));
            return null;
        }
    }, [state.file, state.signatures]);

    const updateSignature = useCallback((id: string, data: Partial<PDFSignature>) => {
        setState(prev => ({
            ...prev,
            signatures: prev.signatures.map(sig =>
                sig.id === id ? { ...sig, ...data } : sig
            ),
        }));
    }, []);

    const setEditingSignature = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, editingSignatureId: id }));
    }, []);

    const reset = useCallback(() => {
        setState({
            file: null,
            signatures: [],
            currentSignature: null,
            currentPageIndex: 0,
            isProcessing: false,
            activeMode: 'draw',
            editingSignatureId: null,
            error: null,
        });
    }, []);

    return {
        state,
        handleFileSelect,
        addSignature,
        updateSignature,
        updateSignaturePosition,
        removeSignature,
        selectSignature,
        setEditingSignature,
        setPage,
        setMode,
        generateSignedPdf,
        reset,
    };
}
