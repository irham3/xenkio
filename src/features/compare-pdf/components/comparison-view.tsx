'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompareViewMode, PageDiffResult, RenderedPage } from '../types';

interface ComparisonViewProps {
    viewMode: CompareViewMode;
    opacity: number;
    currentPage: number;
    diffPage: PageDiffResult | null;
    getRenderedPage: (side: 'a' | 'b', page: number) => Promise<RenderedPage | null>;
}

export function ComparisonView({
    viewMode,
    opacity,
    currentPage,
    diffPage,
    getRenderedPage,
}: ComparisonViewProps) {
    const [pageA, setPageA] = useState<RenderedPage | null>(null);
    const [pageB, setPageB] = useState<RenderedPage | null>(null);
    const [loadedPage, setLoadedPage] = useState<number | null>(null);

    const canvasARef = useRef<HTMLCanvasElement>(null);
    const canvasBRef = useRef<HTMLCanvasElement>(null);

    // Derive loading state: pages haven't loaded yet for the current page
    const loading = loadedPage !== currentPage;

    useEffect(() => {
        let cancelled = false;

        async function loadPages() {
            const [a, b] = await Promise.all([
                getRenderedPage('a', currentPage),
                getRenderedPage('b', currentPage),
            ]);
            if (cancelled) return;
            setPageA(a);
            setPageB(b);
            setLoadedPage(currentPage);
        }

        loadPages().catch(() => {
            if (!cancelled) setLoadedPage(currentPage);
        });

        return () => {
            cancelled = true;
        };
    }, [currentPage, getRenderedPage]);

    // Draw page A canvas
    useEffect(() => {
        if (!pageA || !canvasARef.current) return;
        const canvas = canvasARef.current;
        canvas.width = pageA.width;
        canvas.height = pageA.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.putImageData(pageA.imageData, 0, 0);
    }, [pageA]);

    // Draw page B canvas
    useEffect(() => {
        if (!pageB || !canvasBRef.current) return;
        const canvas = canvasBRef.current;
        canvas.width = pageB.width;
        canvas.height = pageB.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.putImageData(pageB.imageData, 0, 0);
    }, [pageB]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
                <p className="text-sm font-medium">Loading page…</p>
            </div>
        );
    }

    if (viewMode === 'ghost') {
        // Render page A at full opacity, page B on top at `opacity`
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block rounded-xl overflow-hidden shadow-lg border border-gray-100">
                    {pageA && (
                        <canvas
                            ref={canvasARef}
                            className="block max-w-full"
                            style={{ maxWidth: '100%' }}
                        />
                    )}
                    {pageB && (
                        <canvas
                            ref={canvasBRef}
                            className="absolute inset-0 block max-w-full"
                            style={{
                                opacity,
                                mixBlendMode: 'multiply',
                                maxWidth: '100%',
                            }}
                        />
                    )}
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-blue-200 border border-blue-300 inline-block" />
                        Version A (base)
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-orange-200 border border-orange-300 inline-block" />
                        Version B (overlay {Math.round(opacity * 100)}%)
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'diff' && diffPage) {
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="relative inline-block rounded-xl overflow-hidden shadow-lg border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={diffPage.diffDataUrl}
                        alt={`Pixel diff for page ${currentPage}`}
                        className="block max-w-full"
                    />
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" />
                        Changed pixels
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
                        Unchanged pixels
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'sidebyside') {
        return (
            <div className="flex flex-col items-center gap-4">
                <div
                    className={cn(
                        'grid gap-4 w-full',
                        pageA && pageB ? 'grid-cols-2' : 'grid-cols-1'
                    )}
                >
                    {pageA && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-center text-blue-700 bg-blue-50 py-1 rounded-lg">
                                Version A
                            </p>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-blue-100">
                                <canvas
                                    ref={canvasARef}
                                    className="block w-full"
                                />
                            </div>
                        </div>
                    )}
                    {pageB && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-center text-orange-700 bg-orange-50 py-1 rounded-lg">
                                Version B
                            </p>
                            <div className="rounded-xl overflow-hidden shadow-sm border border-orange-100">
                                <canvas
                                    ref={canvasBRef}
                                    className="block w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
