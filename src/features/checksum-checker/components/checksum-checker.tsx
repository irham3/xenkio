'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Copy,
    Check,
    ShieldCheck,
    ShieldX,
    FileCheck,
    RotateCcw,
    File as FileIcon,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useChecksum } from '../hooks/use-checksum';
import { CHECKSUM_ALGORITHMS } from '../constants';
import { ChecksumAlgorithm } from '../types';
import { formatFileSize } from '../lib/checksum-utils';

export function ChecksumChecker() {
    const { file, fileInfo, results, isComputing, expectedHash, setExpectedHash, handleFile, reset } =
        useChecksum();
    const [copiedAlgo, setCopiedAlgo] = useState<ChecksumAlgorithm | null>(null);
    const [selectedAlgo, setSelectedAlgo] = useState<ChecksumAlgorithm>('SHA256');

    const onDrop = useCallback(
        (accepted: File[]) => {
            if (accepted[0]) handleFile(accepted[0]);
        },
        [handleFile],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        noClick: false,
    });

    const handleCopy = (algo: ChecksumAlgorithm, hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedAlgo(algo);
        setTimeout(() => setCopiedAlgo(null), 2000);
    };

    // Determine verification status for the selected algorithm
    const selectedResult = results.find((r) => r.algorithm === selectedAlgo);
    const verificationStatus: boolean | null =
        expectedHash && selectedResult?.hash
            ? selectedResult.hash.toLowerCase() === expectedHash.toLowerCase().trim()
            : null;

    const hasResults = results.some((r) => r.hash !== '');

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
            <div className="grid lg:grid-cols-5 gap-0">

                {/* LEFT PANEL */}
                <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                    <div className="space-y-5">

                        {/* File Drop Zone */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Upload File</Label>
                            {!file ? (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
                                        isDragActive
                                            ? 'border-primary-400 bg-primary-50/60'
                                            : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/30',
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <div
                                        className={cn(
                                            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                                            isDragActive ? 'bg-primary-100' : 'bg-gray-100',
                                        )}
                                    >
                                        <Upload
                                            className={cn(
                                                'w-6 h-6 transition-colors',
                                                isDragActive ? 'text-primary-600' : 'text-gray-400',
                                            )}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            {isDragActive ? 'Drop file here' : 'Drop any file here'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Any file type · Any size</p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <FileIcon className="w-4.5 h-4.5 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{fileInfo?.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {fileInfo ? formatFileSize(fileInfo.size) : ''}{' '}
                                            {fileInfo?.type ? `· ${fileInfo.type}` : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Verify Section */}
                        <div
                            className={cn(
                                'space-y-3 rounded-xl border p-4 transition-all duration-200',
                                hasResults ? 'border-gray-200 bg-gray-50/60' : 'border-dashed border-gray-200 opacity-50',
                            )}
                        >
                            <Label className="text-sm font-semibold text-gray-800">Verify Checksum</Label>

                            {/* Algorithm selector */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-500">Algorithm to verify</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {CHECKSUM_ALGORITHMS.map((a) => (
                                        <button
                                            key={a.id}
                                            onClick={() => setSelectedAlgo(a.id)}
                                            disabled={!hasResults}
                                            className={cn(
                                                'px-3 py-1 text-xs font-medium rounded-lg border transition-all',
                                                selectedAlgo === a.id
                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600',
                                            )}
                                        >
                                            {a.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Expected hash input */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-500">Paste expected checksum</span>
                                <div className="relative">
                                    <Input
                                        value={expectedHash}
                                        onChange={(e) => setExpectedHash(e.target.value)}
                                        placeholder="e.g. a1b2c3d4e5f6..."
                                        disabled={!hasResults}
                                        className={cn(
                                            'font-mono text-xs bg-white pr-9',
                                            expectedHash && verificationStatus === true && 'border-success-500 focus:ring-success-500/20',
                                            expectedHash && verificationStatus === false && 'border-error-500 focus:ring-error-500/20',
                                        )}
                                    />
                                    {expectedHash && (
                                        <button
                                            onClick={() => setExpectedHash('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Verification result inline */}
                            <AnimatePresence>
                                {expectedHash && verificationStatus !== null && (
                                    <motion.div
                                        key={String(verificationStatus)}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                                            verificationStatus
                                                ? 'bg-success-50 text-success-700 border border-success-200'
                                                : 'bg-error-50 text-error-700 border border-error-200',
                                        )}
                                    >
                                        {verificationStatus ? (
                                            <ShieldCheck className="w-4 h-4 shrink-0" />
                                        ) : (
                                            <ShieldX className="w-4 h-4 shrink-0" />
                                        )}
                                        {verificationStatus ? 'Checksum matches ✓' : 'Checksum mismatch ✗'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Reset */}
                        {file && (
                            <Button
                                onClick={reset}
                                variant="outline"
                                className="w-full border-gray-200 hover:bg-gray-100 text-gray-600"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800">Computed Checksums</h3>
                        {isComputing && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-primary-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                                </span>
                                Computing...
                            </span>
                        )}
                    </div>

                    {!file ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileCheck className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">No file selected</h4>
                            <p className="text-xs text-gray-500 max-w-[200px]">
                                Upload any file to compute its checksums instantly.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {CHECKSUM_ALGORITHMS.map((algo) => {
                                const result = results.find((r) => r.algorithm === algo.id);
                                const isVerifyTarget = algo.id === selectedAlgo && !!expectedHash;
                                const matchStatus =
                                    isVerifyTarget && result?.hash
                                        ? result.hash.toLowerCase() === expectedHash.toLowerCase().trim()
                                        : null;

                                return (
                                    <div
                                        key={algo.id}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors',
                                            matchStatus === true && 'bg-success-50/60',
                                            matchStatus === false && 'bg-error-50/40',
                                        )}
                                    >
                                        {/* Algorithm label */}
                                        <div className="w-16 shrink-0">
                                            <span className="text-xs font-semibold text-gray-600 font-mono">
                                                {algo.name}
                                            </span>
                                        </div>

                                        {/* Hash value */}
                                        <div className="flex-1 min-w-0">
                                            {result?.isLoading ? (
                                                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                                            ) : result?.error ? (
                                                <span className="text-xs text-error-500">{result.error}</span>
                                            ) : result?.hash ? (
                                                <span className="font-mono text-[11px] text-gray-600 break-all leading-relaxed">
                                                    {result.hash}
                                                </span>
                                            ) : (
                                                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                                            )}
                                        </div>

                                        {/* Status + Copy */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {matchStatus === true && (
                                                <ShieldCheck className="w-4 h-4 text-success-500" />
                                            )}
                                            {matchStatus === false && (
                                                <ShieldX className="w-4 h-4 text-error-400" />
                                            )}
                                            {result?.hash && !result.isLoading && (
                                                <button
                                                    onClick={() => handleCopy(algo.id, result.hash)}
                                                    className={cn(
                                                        'p-1.5 rounded-lg border text-xs font-medium transition-all',
                                                        copiedAlgo === algo.id
                                                            ? 'bg-success-50 border-success-200 text-success-600'
                                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600',
                                                    )}
                                                    title={`Copy ${algo.name}`}
                                                >
                                                    {copiedAlgo === algo.id ? (
                                                        <Check className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
