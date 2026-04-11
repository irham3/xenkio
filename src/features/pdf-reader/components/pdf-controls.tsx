'use client';

import { CaretLeft, CaretRight, MagnifyingGlassPlus, MagnifyingGlassMinus, Hand, CircleNotch, ArrowCounterClockwise, ArrowsOut, ArrowsIn } from '@phosphor-icons/react/dist/ssr';

interface PdfControlsProps {
    currentPage: number;
    totalPages: number;
    zoom: number;
    isGestureActive: boolean;
    isGestureLoading: boolean;
    isFullscreen: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    onGoToPage: (page: number) => void;
    onZoomChange: (zoom: number) => void;
    onToggleGesture: () => void;
    onToggleFullscreen: () => void;
    onReset: () => void;
}

export function PdfControls({
    currentPage,
    totalPages,
    zoom,
    isGestureActive,
    isGestureLoading,
    isFullscreen,
    onPrevPage,
    onNextPage,
    onGoToPage,
    onZoomChange,
    onToggleGesture,
    onToggleFullscreen,
    onReset,
}: PdfControlsProps) {
    function handlePageInput(e: React.ChangeEvent<HTMLInputElement>): void {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            onGoToPage(value);
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-soft">
            {/* Left: Page navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <CaretLeft className="w-5 h-5"  weight="duotone"/>
                </button>

                <div className="flex items-center gap-1.5 text-sm">
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={handlePageInput}
                        className="w-12 text-center border border-gray-200 rounded-md py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        aria-label="Current page"
                    />
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 font-medium">{totalPages}</span>
                </div>

                <button
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <CaretRight className="w-5 h-5"  weight="duotone"/>
                </button>
            </div>

            {/* Center: Zoom controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onZoomChange(zoom - 0.2)}
                    disabled={zoom <= 0.5}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Zoom out"
                >
                    <MagnifyingGlassMinus className="w-4 h-4"  weight="duotone"/>
                </button>
                <span className="text-sm font-medium text-gray-700 w-12 text-center tabular-nums">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => onZoomChange(zoom + 0.2)}
                    disabled={zoom >= 3}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Zoom in"
                >
                    <MagnifyingGlassPlus className="w-4 h-4"  weight="duotone"/>
                </button>
            </div>

            {/* Right: Gesture toggle & reset */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleGesture}
                    disabled={isGestureLoading}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isGestureActive
                            ? 'bg-primary-600 text-white shadow-primary hover:bg-primary-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    aria-label={isGestureActive ? 'Disable gesture control' : 'Enable gesture control'}
                >
                    {isGestureLoading ? (
                        <CircleNotch className="w-4 h-4 animate-spin"  weight="duotone"/>
                    ) : (
                        <Hand className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                        {isGestureLoading
                            ? 'Loading AI...'
                            : isGestureActive
                                ? 'Gesture On'
                                : 'Gesture'}
                    </span>
                </button>

                <button
                    onClick={onToggleFullscreen}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                    {isFullscreen ? (
                        <ArrowsIn className="w-4 h-4"  weight="duotone"/>
                    ) : (
                        <ArrowsOut className="w-4 h-4"  weight="duotone"/>
                    )}
                </button>

                <button
                    onClick={onReset}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Reset reader"
                >
                    <ArrowCounterClockwise className="w-4 h-4"  weight="duotone"/>
                </button>
            </div>
        </div>
    );
}
