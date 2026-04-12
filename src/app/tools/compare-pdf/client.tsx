'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleNotch, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { CompareViewMode } from '@/features/compare-pdf/types';
import { usePdfCompare } from '@/features/compare-pdf/hooks/use-pdf-compare';
import { PdfUploadPair } from '@/features/compare-pdf/components/pdf-upload-pair';
import { CompareControls } from '@/features/compare-pdf/components/compare-controls';
import { ComparisonView } from '@/features/compare-pdf/components/comparison-view';

export default function ComparePdfClient() {
    const [viewMode, setViewMode] = useState<CompareViewMode>('ghost');
    const [opacity, setOpacity] = useState(0.5);

    const {
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
    } = usePdfCompare();

    const isComparing = status === 'comparing';
    const isLoading = status === 'loading-a' || status === 'loading-b';
    const hasResult = status === 'complete' && result !== null;

    const currentDiffPage = result
        ? result.pages.find((p) => p.pageNumber === currentPage) ?? null
        : null;

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!hasResult ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-3xl mx-auto py-4"
                    >
                        {/* Upload + Compare trigger */}
                        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 space-y-4">
                            <PdfUploadPair
                                pdfA={pdfA}
                                pdfB={pdfB}
                                onSelectA={(f) => loadPdf(f, 'a')}
                                onSelectB={(f) => loadPdf(f, 'b')}
                                onClearA={() => clearPdf('a')}
                                onClearB={() => clearPdf('b')}
                                disabled={isLoading || isComparing}
                                onCompare={compare}
                                isComparing={isComparing}
                            />
                        </div>

                        {/* Progress */}
                        <AnimatePresence>
                            {isComparing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 bg-white rounded-2xl ring-1 ring-gray-100 p-5 flex flex-col items-center gap-3"
                                >
                                    <CircleNotch className="w-8 h-8 text-primary-500 animate-spin"  weight="duotone"/>
                                    <p className="text-sm font-medium text-gray-700">
                                        Comparing PDFs — {progress}%
                                    </p>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${progress}%` }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 flex items-center gap-3 p-4 bg-error-50 text-error-700 rounded-xl border border-error-100 text-sm"
                                >
                                    <WarningCircle className="w-5 h-5 shrink-0"  weight="duotone"/>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col lg:flex-row gap-6 items-start"
                    >
                        {/* Main comparison canvas */}
                        <div className="flex-1 min-w-0 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5 overflow-auto">
                            {/* Summary banner */}
                            {currentDiffPage && (
                                <div className="mb-4 px-4 py-2.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span className="font-medium text-gray-700">
                                        Page {currentPage} of {maxPages}
                                    </span>
                                    <span
                                        className={
                                            currentDiffPage.diffPercentage > 5
                                                ? 'text-error-600 font-semibold'
                                                : currentDiffPage.diffPercentage > 0
                                                ? 'text-warning-600 font-semibold'
                                                : 'text-success-600 font-semibold'
                                        }
                                    >
                                        {currentDiffPage.diffPercentage === 0
                                            ? 'Identical'
                                            : `${currentDiffPage.diffPercentage.toFixed(2)}% changed`}
                                    </span>
                                </div>
                            )}

                            <ComparisonView
                                viewMode={viewMode}
                                opacity={opacity}
                                currentPage={currentPage}
                                diffPage={currentDiffPage}
                                getRenderedPage={getRenderedPage}
                            />
                        </div>

                        {/* Sidebar controls */}
                        <div className="w-full lg:w-70 shrink-0 lg:sticky lg:top-6 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">
                                Comparison Settings
                            </h3>
                            <CompareControls
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                opacity={opacity}
                                onOpacityChange={setOpacity}
                                currentPage={currentPage}
                                maxPages={maxPages}
                                onPageChange={setCurrentPage}
                                diffPercentage={currentDiffPage?.diffPercentage}
                                onReset={reset}
                            />

                            {/* Pages overview */}
                            {result && result.pages.length > 1 && (
                                <div className="mt-5 pt-5 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        All Pages
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.pages.map((p) => (
                                            <button
                                                key={p.pageNumber}
                                                type="button"
                                                onClick={() => setCurrentPage(p.pageNumber)}
                                                title={`Page ${p.pageNumber}: ${p.diffPercentage.toFixed(2)}% changed`}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                                    p.pageNumber === currentPage
                                                        ? 'bg-gray-900 text-white'
                                                        : p.diffPercentage > 5
                                                        ? 'bg-error-100 text-error-700 hover:bg-error-200'
                                                        : p.diffPercentage > 0
                                                        ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                                                        : 'bg-success-100 text-success-700 hover:bg-success-200'
                                                }`}
                                            >
                                                {p.pageNumber}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
