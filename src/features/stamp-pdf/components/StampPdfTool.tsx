
'use client';

import React, { useCallback } from 'react';
import { useStampPdf } from '../hooks/use-stamp-pdf';
import { StampPicker } from './stamp-picker';
import { StampContentEditor } from './stamp-content-editor';
import { PdfViewer } from './pdf-viewer';
import { StampTemplate, PDFStamp } from '../types';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Download, RotateCcw, Loader2, FileText, RefreshCw, AlertCircle } from 'lucide-react';

export function StampPdfTool() {
    const {
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
    } = useStampPdf();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles[0]) {
                if (state.file) {
                    switchPdf(acceptedFiles[0]);
                } else {
                    handleFileSelect(acceptedFiles[0]);
                }
            }
        },
        [handleFileSelect, switchPdf, state.file]
    );

    const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        noClick: !!state.file,
        noKeyboard: !!state.file,
    });

    const handleStampSelect = useCallback(
        (template: StampTemplate) => {
            const newStamp: PDFStamp = {
                id: uuidv4(),
                type: template.type,
                x: 50,
                y: 50,
                width: template.defaultConfig.width || 220,
                height: template.defaultConfig.height || 100,
                pageIndex: state.currentPageIndex,
                rotation: 0,
                opacity: 1,
                color: template.defaultConfig.color || '#4b5563',
                borderColor: template.defaultConfig.borderColor || '#d1d5db',
                backgroundColor: template.defaultConfig.backgroundColor || '#f9fafb',
                fontSize: template.defaultConfig.fontSize || 13,
                // Type-specific defaults
                label: template.defaultConfig.label,
                status: template.defaultConfig.status,
                date: template.defaultConfig.date || new Date().toISOString().split('T')[0],
                dateLabel: template.defaultConfig.dateLabel,
                signerName: template.defaultConfig.signerName,
                checklist: template.defaultConfig.checklist
                    ? template.defaultConfig.checklist.map((item) => ({
                        ...item,
                        id: uuidv4(),
                    }))
                    : undefined,
                checklistTitle: template.defaultConfig.checklistTitle,
                notes: template.defaultConfig.notes,
                costLabel: template.defaultConfig.costLabel,
                costAmount: template.defaultConfig.costAmount,
                costCurrency: template.defaultConfig.costCurrency,
            };
            addStamp(newStamp);
        },
        [addStamp, state.currentPageIndex]
    );

    const handleDownload = useCallback(async () => {
        const pdfBytes = await generateStampedPdf();
        if (!pdfBytes) return;

        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.file
            ? `stamped-${state.file.name}`
            : 'stamped-document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [generateStampedPdf, state.file]);

    const handleEditStamp = useCallback(
        (id: string) => {
            if (state.editingStampId === id) {
                setEditingStamp(null);
            } else {
                setEditingStamp(id);
                selectStamp(id);
            }
        },
        [state.editingStampId, setEditingStamp, selectStamp]
    );

    const editingStamp = state.stamps.find((s) => s.id === state.editingStampId);

    // No file loaded — show upload
    if (!state.file) {
        return (
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
                    isDragActive
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-700">
                            {isDragActive ? 'Drop your PDF here' : 'Upload PDF to stamp'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Drag & drop or click to browse · Max 20MB
                        </p>
                    </div>
                </div>
                {state.isProcessing && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Loading PDF...</span>
                    </div>
                )}
                {state.error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{state.error}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                        {state.file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({state.file.totalPages} {state.file.totalPages === 1 ? 'page' : 'pages'})
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={openFilePicker}
                        className="text-xs h-8"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Switch PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                        className="text-xs h-8"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleDownload}
                        disabled={state.stamps.length === 0 || state.isProcessing}
                        className="text-xs h-8"
                    >
                        {state.isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Download
                    </Button>
                </div>
            </div>

            {state.error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {state.error}
                </div>
            )}

            {/* Main layout: sidebar + PDF viewer */}
            <div className="flex gap-4 flex-col lg:flex-row" {...getRootProps()}>
                <input {...getInputProps()} />

                {/* Left sidebar — stamp picker & editor */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                    <StampPicker onSelect={handleStampSelect} />

                    {/* Stamp editor panel */}
                    {editingStamp && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                            <StampContentEditor
                                stamp={editingStamp}
                                onUpdate={updateStamp}
                            />
                        </div>
                    )}

                    {/* Stamps list */}
                    {state.stamps.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Placed Stamps ({state.stamps.length})
                            </h3>
                            <div className="space-y-1">
                                {state.stamps.map((stamp) => (
                                    <div
                                        key={stamp.id}
                                        className={cn(
                                            'flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-colors',
                                            state.selectedStampId === stamp.id
                                                ? 'bg-primary-50 border border-primary-200'
                                                : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                        )}
                                        onClick={() => {
                                            selectStamp(stamp.id);
                                            setPage(stamp.pageIndex);
                                        }}
                                    >
                                        <span className="text-gray-700 truncate capitalize text-xs">
                                            {stamp.type}
                                            {stamp.label ? `: ${stamp.label}` : ''}
                                            {stamp.type === 'date' ? `: ${stamp.date}` : ''}
                                        </span>
                                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                                            p.{stamp.pageIndex + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* PDF viewer */}
                <div className="flex-1 min-w-0">
                    <PdfViewer
                        file={state.file}
                        stamps={state.stamps}
                        currentPageIndex={state.currentPageIndex}
                        selectedStampId={state.selectedStampId}
                        editingStampId={state.editingStampId}
                        onUpdateStamp={updateStamp}
                        onRemoveStamp={removeStamp}
                        onSelectStamp={selectStamp}
                        onEditStamp={handleEditStamp}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
}
