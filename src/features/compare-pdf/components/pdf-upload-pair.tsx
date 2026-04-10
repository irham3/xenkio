'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PdfInfo } from '../types';

interface SinglePdfDropzoneProps {
    label: string;
    accentClass: string;
    pdfInfo: PdfInfo | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    disabled?: boolean;
}

function SinglePdfDropzone({
    label,
    accentClass,
    pdfInfo,
    onFileSelect,
    onClear,
    disabled,
}: SinglePdfDropzoneProps) {
    const onDrop = useCallback(
        (accepted: File[]) => {
            if (accepted.length > 0) onFileSelect(accepted[0]);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false,
        disabled,
    });

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
            {pdfInfo ? (
                <div
                    className={cn(
                        'relative flex items-center gap-4 p-5 rounded-2xl border-2 bg-white transition-all',
                        accentClass
                    )}
                >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className="font-semibold text-gray-900 truncate text-sm"
                            title={pdfInfo.name}
                        >
                            {pdfInfo.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {pdfInfo.numPages} page{pdfInfo.numPages !== 1 ? 's' : ''} ·{' '}
                            {formatSize(pdfInfo.size)}
                        </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={disabled}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[160px]',
                        isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    )}
                >
                    <input {...getInputProps()} />
                    <div
                        className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                            isDragActive ? 'bg-primary-100' : 'bg-gray-100'
                        )}
                    >
                        <Upload
                            className={cn(
                                'w-7 h-7 transition-colors',
                                isDragActive ? 'text-primary-600' : 'text-gray-400'
                            )}
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-gray-800">
                            {isDragActive ? 'Drop PDF here' : 'Select PDF'}
                        </p>
                        <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
                    </div>
                </div>
            )}
        </div>
    );
}

interface PdfUploadPairProps {
    pdfA: PdfInfo | null;
    pdfB: PdfInfo | null;
    onSelectA: (file: File) => void;
    onSelectB: (file: File) => void;
    onClearA: () => void;
    onClearB: () => void;
    disabled?: boolean;
    onCompare: () => void;
    isComparing: boolean;
}

export function PdfUploadPair({
    pdfA,
    pdfB,
    onSelectA,
    onSelectB,
    onClearA,
    onClearB,
    disabled,
    onCompare,
    isComparing,
}: PdfUploadPairProps) {
    const canCompare = !!(pdfA && pdfB) && !isComparing;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <SinglePdfDropzone
                    label="Original PDF (Version A)"
                    accentClass="border-blue-200"
                    pdfInfo={pdfA}
                    onFileSelect={onSelectA}
                    onClear={onClearA}
                    disabled={disabled}
                />

                {/* Divider */}
                <div className="flex sm:flex-col items-center justify-center gap-2 shrink-0">
                    <div className="h-px sm:h-16 w-16 sm:w-px bg-gray-200" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">VS</span>
                    <div className="h-px sm:h-16 w-16 sm:w-px bg-gray-200" />
                </div>

                <SinglePdfDropzone
                    label="Modified PDF (Version B)"
                    accentClass="border-orange-200"
                    pdfInfo={pdfB}
                    onFileSelect={onSelectB}
                    onClear={onClearB}
                    disabled={disabled}
                />
            </div>

            <Button
                onClick={onCompare}
                disabled={!canCompare}
                className="w-full h-12 text-base font-semibold rounded-xl"
            >
                {isComparing ? 'Comparing…' : 'Compare PDFs'}
            </Button>
        </div>
    );
}
