
import { useState, useCallback } from 'react';
import { PDFStamp, StampPdfState } from '../types';
import { renderPdfPages, embedStamps } from '../lib/stamp-renderer';
import { MAX_PDF_SIZE } from '../constants';

export function useStampPdf() {
    const [state, setState] = useState<StampPdfState>({
        file: null,
        stamps: [],
        selectedStampId: null,
        editingStampId: null,
        currentPageIndex: 0,
        isProcessing: false,
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
                stamps: [],
                selectedStampId: null,
                editingStampId: null,
                currentPageIndex: 0,
                isProcessing: false,
            }));
        } catch (err) {
            console.error(err);
            setState(prev => ({
                ...prev,
                error: 'Failed to process PDF file.',
                isProcessing: false,
            }));
        }
    }, []);

    const addStamp = useCallback((stamp: PDFStamp) => {
        setState(prev => ({
            ...prev,
            stamps: [...prev.stamps, stamp],
            selectedStampId: stamp.id,
            editingStampId: stamp.id,
        }));
    }, []);

    const updateStamp = useCallback((id: string, updates: Partial<PDFStamp>) => {
        setState(prev => ({
            ...prev,
            stamps: prev.stamps.map(s => (s.id === id ? { ...s, ...updates } : s)),
        }));
    }, []);

    const removeStamp = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            stamps: prev.stamps.filter(s => s.id !== id),
            selectedStampId: prev.selectedStampId === id ? null : prev.selectedStampId,
            editingStampId: prev.editingStampId === id ? null : prev.editingStampId,
        }));
    }, []);

    const selectStamp = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, selectedStampId: id }));
    }, []);

    const setEditingStamp = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, editingStampId: id }));
    }, []);

    const setPage = useCallback((index: number) => {
        setState(prev => ({ ...prev, currentPageIndex: index, selectedStampId: null, editingStampId: null }));
    }, []);

    const generateStampedPdf = useCallback(async (): Promise<Uint8Array | null> => {
        if (!state.file) return null;

        setState(prev => ({ ...prev, isProcessing: true }));
        try {
            const pdfBytes = await embedStamps(state.file.file, state.stamps);
            setState(prev => ({ ...prev, isProcessing: false }));
            return pdfBytes;
        } catch (err) {
            console.error(err);
            setState(prev => ({
                ...prev,
                error: 'Failed to generate stamped PDF.',
                isProcessing: false,
            }));
            return null;
        }
    }, [state.file, state.stamps]);

    const switchPdf = useCallback(async (file: File) => {
        setState(prev => ({
            ...prev,
            stamps: [],
            selectedStampId: null,
            editingStampId: null,
        }));
        // Use the main file select
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
                currentPageIndex: 0,
                isProcessing: false,
            }));
        } catch (err) {
            console.error(err);
            setState(prev => ({
                ...prev,
                error: 'Failed to process PDF file.',
                isProcessing: false,
            }));
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            file: null,
            stamps: [],
            selectedStampId: null,
            editingStampId: null,
            currentPageIndex: 0,
            isProcessing: false,
            error: null,
        });
    }, []);

    return {
        state,
        handleFileSelect,
        addStamp,
        updateStamp,
        removeStamp,
        selectStamp,
        setEditingStamp,
        setPage,
        generateStampedPdf,
        switchPdf,
        reset,
    };
}
