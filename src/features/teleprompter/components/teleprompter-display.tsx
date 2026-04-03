'use client';

import { useRef } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    ArrowLeft,
    Maximize,
    Minimize,
    Plus,
    Minus,
} from 'lucide-react';
import { TeleprompterConfig, TeleprompterState } from '../types';
import { FONT_FAMILIES } from '../lib/teleprompter-utils';

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

    const textStyle: React.CSSProperties = {
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        fontFamily: FONT_FAMILIES[config.fontFamily],
        color: config.textColor,
        lineHeight: config.lineSpacing,
        transform: config.mirror ? 'scaleX(-1)' : undefined,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    };

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
                    {/* Font size controls */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2 py-1"
                        style={{ border: `1.5px solid ${config.textColor}33` }}
                    >
                        <button
                            onClick={() => onFontSizeChange(-4)}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                            style={{ color: config.textColor }}
                            title="Kecilkan font"
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
                            title="Besarkan font"
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
                            title="Perlambat"
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
                            title="Percepat"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={onReset}
                        className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ color: config.textColor, border: `1.5px solid ${config.textColor}33` }}
                        title="Mulai ulang"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={() => onToggleFullscreen(containerRef.current)}
                        className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ color: config.textColor, border: `1.5px solid ${config.textColor}33` }}
                        title={state.isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
                    >
                        {state.isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                        ) : (
                            <Maximize className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Scrollable text area */}
            <div
                ref={scrollRef as React.RefObject<HTMLDivElement>}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto px-8 md:px-16 lg:px-32"
                style={{ scrollBehavior: 'auto' }}
            >
                {/* Top spacer so text starts at bottom */}
                <div className="h-[60vh]" />
                <p style={textStyle}>{config.script}</p>
                {/* Bottom spacer */}
                <div className="h-[80vh]" />
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
            <div className="flex justify-center pb-6 pt-3 flex-shrink-0">
                <button
                    onClick={onTogglePlay}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{
                        backgroundColor: config.textColor,
                        color: config.backgroundColor,
                    }}
                >
                    {state.isPlaying ? (
                        <>
                            <Pause className="w-6 h-6" />
                            Jeda
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6" />
                            Mulai
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
