'use client';

import {
    Play,
    Pause,
    RotateCcw,
    ArrowLeft,
    Maximize,
    Minimize,
    Plus,
    Minus,
    ChevronRight,
    ChevronLeft,
    Clock,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { TeleprompterConfig, TeleprompterState } from '../types';
import { FONT_FAMILIES, estimateDuration } from '../lib/teleprompter-utils';

interface TeleprompterDisplayProps {
    config: TeleprompterConfig;
    state: TeleprompterState;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    onTogglePlay: () => void;
    onReset: () => void;
    onBack: () => void;
    onScroll: () => void;
    onToggleFullscreen: (el: HTMLElement | null) => void;
    onFontSizeChange: (delta: number) => void;
    onSpeedChange: (delta: number) => void;
}

export function TeleprompterDisplay({
    config,
    state,
    scrollRef,
    onTogglePlay,
    onReset,
    onBack,
    onScroll,
    onToggleFullscreen,
    onFontSizeChange,
    onSpeedChange,
}: TeleprompterDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Handle scroll progress
    const handleScroll = useCallback(() => {
        onScroll(); // Call hook's onScroll
        if (scrollRef.current && progressBarRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const progress = (scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100;
            progressBarRef.current.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }, [onScroll, scrollRef]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Avoid hijacking when user is typing in an input/textarea
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === ' ') {
                e.preventDefault();
                onTogglePlay();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onSpeedChange(1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                onSpeedChange(-1);
            } else if (e.key === '=' || e.key === '+') {
                onFontSizeChange(4);
            } else if (e.key === '-' || e.key === '_') {
                onFontSizeChange(-4);
            } else if (e.key === 'r' || e.key === 'R') {
                onReset();
            } else if (e.key === 'f' || e.key === 'F') {
                onToggleFullscreen(containerRef.current);
            }
        },
        [onTogglePlay, onSpeedChange, onFontSizeChange, onReset, onToggleFullscreen],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Format the script into individually wrapped words for highlighting
    const contentNodes = useMemo(() => {
        const tokens = config.script.split(/(\s+)/);
        return tokens.map((token, index) => {
            if (/^\s+$/.test(token)) {
                return <span key={index}>{token}</span>;
            }
            return (
                <span
                    key={index}
                    className="tele-word transition-all duration-200"
                    style={{ opacity: 1 }}
                >
                    {token}
                </span>
            );
        });
    }, [config.script]);

    // Intersection Observer for highlighting words as they pass the center
    useEffect(() => {
        if (!scrollRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.textShadow = '0 0 1px currentColor, 0 0 2px currentColor';
                        // Add a subtle scaling without disrupting line flow
                        (entry.target as HTMLElement).style.transform = 'scale(1.05)';
                        (entry.target as HTMLElement).style.display = 'inline-block';
                    } else {
                        (entry.target as HTMLElement).style.textShadow = 'none';
                        (entry.target as HTMLElement).style.transform = 'scale(1)';
                    }
                });
            },
            {
                root: scrollRef.current,
                // Narrow band in the middle of the screen (20% height)
                rootMargin: '-40% 0px -40% 0px',
            }
        );

        const spans = scrollRef.current.querySelectorAll('.tele-word');
        spans.forEach((span) => observer.observe(span));

        return () => observer.disconnect();
    }, [contentNodes, scrollRef]);

    const textStyle: React.CSSProperties = {
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        fontFamily: FONT_FAMILIES[config.fontFamily],
        color: config.textColor,
        lineHeight: config.lineSpacing,
        transform: config.mirror ? 'scaleX(-1)' : undefined,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
    };

    const estimatedTime = estimateDuration(config.script, config.scrollSpeed);

    return (
        <div
            ref={containerRef}
            className="relative w-full flex flex-col"
            style={{ backgroundColor: config.backgroundColor, minHeight: '100vh' }}
        >
            {/* Top controls bar */}
            <div
                className="flex items-center justify-between px-4 py-3 z-10 flex-shrink-0"
                style={{ backgroundColor: `${config.backgroundColor}dd` }}
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
                    {/* Estimated time */}
                    <div
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ border: `1.5px solid ${config.textColor}22`, color: `${config.textColor}88` }}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono">{estimatedTime}</span>
                    </div>

                    {/* Font size controls */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2 py-1"
                        style={{ border: `1.5px solid ${config.textColor}33` }}
                    >
                        <button
                            onClick={() => onFontSizeChange(-4)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                            title="Decrease font size (–)"
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
                            title="Increase font size (+)"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Speed controls */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2 py-1"
                        style={{ border: `1.5px solid ${config.textColor}33` }}
                    >
                        <button
                            onClick={() => onSpeedChange(-1)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                            title="Slow down (↓)"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                            className="text-xs w-6 text-center font-semibold"
                            style={{ color: config.textColor }}
                        >
                            {config.scrollSpeed}
                        </span>
                        <button
                            onClick={() => onSpeedChange(1)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                            title="Speed up (↑)"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={onReset}
                        className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ color: config.textColor, border: `1.5px solid ${config.textColor}33` }}
                        title="Restart (R)"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={() => onToggleFullscreen(containerRef.current)}
                        className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ color: config.textColor, border: `1.5px solid ${config.textColor}33` }}
                        title={state.isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                    >
                        {state.isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                        ) : (
                            <Maximize className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 z-10 flex-shrink-0" style={{ backgroundColor: `${config.textColor}22` }}>
                <div
                    ref={progressBarRef}
                    className="h-full transition-none"
                    style={{ backgroundColor: config.textColor, width: '0%' }}
                />
            </div>

            {/* Mirror warning */}
            {config.mirror && (
                <div
                    className="text-center text-xs py-1.5 flex-shrink-0 font-semibold tracking-wide"
                    style={{ backgroundColor: `${config.textColor}18`, color: `${config.textColor}cc` }}
                >
                    ⟺ MIRROR MODE — text appears reversed. Use a physical mirror or reflective glass to read correctly.
                </div>
            )}

            {/* Countdown Overlay */}
            {state.countdown !== null && (
                <div className="absolute inset-x-0 inset-y-0 z-50 flex items-center justify-center pointer-events-none mt-20">
                    <div
                        className="text-9xl font-bold animate-pulse drop-shadow-2xl bg-black/40 backdrop-blur px-8 py-4 rounded-3xl"
                        style={{ color: config.textColor }}
                    >
                        {state.countdown > 0 ? state.countdown : 'GO!'}
                    </div>
                </div>
            )}

            {/* Scrollable text area */}
            <div
                ref={scrollRef as React.RefObject<HTMLDivElement>}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overflow-x-hidden px-8 md:px-16 lg:px-32"
                style={{ scrollBehavior: 'auto' }}
            >
                {/* Top spacer so text starts at bottom */}
                <div className="h-[60vh]" />
                <p style={textStyle}>{contentNodes}</p>
                {/* Bottom spacer */}
                <div className="h-[80vh]" />
            </div>

            {/* Eye-line indicator (side markers) */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                style={{ color: `${config.textColor}99` }}
            >
                <ChevronRight className="w-8 h-8 -ml-1 flex-shrink-0" />
            </div>
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                style={{ color: `${config.textColor}99` }}
            >
                <ChevronLeft className="w-8 h-8 -mr-1 flex-shrink-0" />
            </div>

            {/* Center line indicator */}
            <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                    top: '50%',
                    height: '2px',
                    background: `${config.textColor}22`,
                }}
            />

            {/* Play/Pause button — fixed center bottom */}
            <div className="flex flex-col items-center pb-6 pt-3 flex-shrink-0 gap-2">
                <button
                    onClick={onTogglePlay}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{
                        backgroundColor: config.textColor,
                        color: config.backgroundColor,
                    }}
                >
                    {state.isPlaying || state.countdown !== null ? (
                        <>
                            <Pause className="w-6 h-6" />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6" />
                            Start
                        </>
                    )}
                </button>
                {/* Keyboard shortcut hint */}
                {!state.isFullscreen && (
                    <p className="text-xs" style={{ color: `${config.textColor}44` }}>
                        Space: play/pause · ↑↓: speed · +−: font · R: restart · F: fullscreen
                    </p>
                )}
            </div>
        </div>
    );
}
