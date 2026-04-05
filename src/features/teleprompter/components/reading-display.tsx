'use client';

import { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Maximize, Minimize, Plus, Minus } from 'lucide-react';
import { TeleprompterConfig, TeleprompterState } from '../types';
import { FONT_FAMILIES } from '../lib/teleprompter-utils';

interface ReadingDisplayProps {
    config: TeleprompterConfig;
    state: TeleprompterState;
    onNext: () => void;
    onPrev: () => void;
    onBack: () => void;
    onToggleFullscreen: (el: HTMLElement | null) => void;
    onFontSizeChange: (delta: number) => void;
}

export function ReadingDisplay({
    config,
    state,
    onNext,
    onPrev,
    onBack,
    onToggleFullscreen,
    onFontSizeChange,
}: ReadingDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { segments, currentSegmentIndex } = state;
    const currentSegment = segments[currentSegmentIndex] ?? '';
    const isFirst = currentSegmentIndex === 0;
    const isLast = segments.length === 0 || currentSegmentIndex >= segments.length - 1;
    const progress = segments.length > 0 ? ((currentSegmentIndex + 1) / segments.length) * 100 : 0;

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                if (!isLast) onNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!isFirst) onPrev();
            }
        },
        [isLast, isFirst, onNext, onPrev],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Touch/swipe support
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const deltaX = touchStartX.current - e.changedTouches[0].clientX;
        const deltaY = touchStartY.current - e.changedTouches[0].clientY;
        
        // Ensure swipe is mostly horizontal to avoid triggering during vertical scroll
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            if (deltaX > 0 && !isLast) onNext();
            else if (deltaX < 0 && !isFirst) onPrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const textStyle: React.CSSProperties = {
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        fontFamily: FONT_FAMILIES[config.fontFamily],
        color: config.textColor,
        lineHeight: config.lineSpacing,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        textAlign: 'center',
        maxWidth: '100%',
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full flex flex-col select-none"
            style={{ backgroundColor: config.backgroundColor, minHeight: '100vh' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Top bar */}
            <div
                className="flex items-center justify-between px-4 py-3 z-10 flex-shrink-0"
                style={{ backgroundColor: `${config.backgroundColor}ee` }}
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ color: config.textColor, border: `1.5px solid ${config.textColor}44` }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Setup</span>
                </button>

                <div className="flex items-center gap-2">
                    {/* Progress */}
                    <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: config.textColor }}
                    >
                        {currentSegmentIndex + 1} / {segments.length}
                    </span>

                    {/* Font size */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2 py-1"
                        style={{ border: `1.5px solid ${config.textColor}33` }}
                    >
                        <button
                            onClick={() => onFontSizeChange(-4)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                            className="text-xs font-mono w-10 text-center font-semibold"
                            style={{ color: config.textColor }}
                        >
                            {config.fontSize}px
                        </span>
                        <button
                            onClick={() => onFontSizeChange(4)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={() => onToggleFullscreen(containerRef.current)}
                        className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ color: config.textColor, border: `1.5px solid ${config.textColor}33` }}
                    >
                        {state.isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                        ) : (
                            <Maximize className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 flex-shrink-0" style={{ backgroundColor: `${config.textColor}22` }}>
                <div
                    className="h-full transition-all duration-300"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: config.textColor,
                        opacity: 0.6,
                    }}
                />
            </div>

            {/* Text content */}
            <div className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-8 md:px-16 lg:px-32 ${config.mirror ? '-scale-x-100' : ''}`}>
                <div className="m-auto w-full max-w-5xl py-12">
                    <p style={textStyle}>{currentSegment}</p>
                </div>
            </div>

            {/* Navigation buttons */}
            <div
                className="flex items-center justify-between px-4 pb-8 pt-4 flex-shrink-0 gap-4"
                style={{ backgroundColor: `${config.backgroundColor}ee` }}
            >
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: `${config.textColor}22`,
                        color: config.textColor,
                        border: `2px solid ${config.textColor}44`,
                    }}
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Dot indicators (max 10 shown) */}
                <div className="flex items-center gap-1.5 overflow-hidden max-w-[200px]">
                    {segments.slice(0, 10).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full flex-shrink-0 transition-all"
                            style={{
                                width: i === currentSegmentIndex ? 10 : 6,
                                height: i === currentSegmentIndex ? 10 : 6,
                                backgroundColor: config.textColor,
                                opacity: i === currentSegmentIndex ? 0.9 : 0.3,
                            }}
                        />
                    ))}
                    {segments.length > 10 && (
                        <span className="text-xs ml-1" style={{ color: config.textColor, opacity: 0.5 }}>
                            …
                        </span>
                    )}
                </div>

                <button
                    onClick={onNext}
                    disabled={isLast}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: config.textColor,
                        color: config.backgroundColor,
                    }}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Keyboard hint */}
            {!state.isFullscreen && (
                <p
                    className="text-center text-xs pb-4 flex-shrink-0"
                    style={{ color: config.textColor, opacity: 0.4 }}
                >
                    Press ←→ or Space to navigate • Swipe for touch screen
                </p>
            )}
        </div>
    );
}
