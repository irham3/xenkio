'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { RunningTextConfig } from '../types';

interface RunningTextDisplayProps {
    config: RunningTextConfig;
    isFullscreen: boolean;
}

const STROBE_PRESETS: Record<string, { color1: string; color2: string; speed: number }> = {
    ambulance: { color1: '#ff0000', color2: '#ffffff', speed: 200 },
    police: { color1: '#ff0000', color2: '#0055ff', speed: 150 },
    warning: { color1: '#ff9900', color2: '#ffff00', speed: 350 },
};

const BLINK_DURATION: Record<string, string> = {
    slow: '1.2s',
    medium: '0.6s',
    fast: '0.25s',
};

const FONT_FAMILIES: Record<string, string> = {
    sans: 'Arial, Helvetica, sans-serif',
    mono: "'Courier New', Courier, monospace",
    serif: 'Georgia, "Times New Roman", serif',
    impact: 'Impact, "Arial Narrow", sans-serif',
};

export function RunningTextDisplay({ config, isFullscreen }: RunningTextDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftHalfRef = useRef<HTMLDivElement>(null);
    const rightHalfRef = useRef<HTMLDivElement>(null);

    // ── Solid-mode strobe effect ──────────────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el || config.backgroundMode !== 'solid') return;

        if (config.strobeMode === 'off') {
            el.style.backgroundColor = config.backgroundColor;
            return;
        }

        const preset = STROBE_PRESETS[config.strobeMode];
        const color1 = preset ? preset.color1 : config.strobeColor1;
        const color2 = preset ? preset.color2 : config.strobeColor2;
        const speed = preset ? preset.speed : config.strobeSpeed;

        let toggle = false;
        el.style.backgroundColor = color1;

        const interval = setInterval(() => {
            toggle = !toggle;
            el.style.backgroundColor = toggle ? color2 : color1;
        }, speed);

        return () => {
            clearInterval(interval);
            el.style.backgroundColor = config.backgroundColor;
        };
    }, [
        config.backgroundMode,
        config.strobeMode,
        config.strobeSpeed,
        config.strobeColor1,
        config.strobeColor2,
        config.backgroundColor,
    ]);

    // ── Split-mode swap effect ────────────────────────────────────────────
    useEffect(() => {
        const leftEl = leftHalfRef.current;
        const rightEl = rightHalfRef.current;
        if (!leftEl || !rightEl || config.backgroundMode !== 'split') return;

        leftEl.style.backgroundColor = config.splitColorLeft;
        rightEl.style.backgroundColor = config.splitColorRight;

        if (!config.splitSwap) return;

        let toggle = false;
        const interval = setInterval(() => {
            toggle = !toggle;
            leftEl.style.backgroundColor = toggle
                ? config.splitColorRight
                : config.splitColorLeft;
            rightEl.style.backgroundColor = toggle
                ? config.splitColorLeft
                : config.splitColorRight;
        }, config.splitSwapSpeed);

        return () => clearInterval(interval);
    }, [
        config.backgroundMode,
        config.splitColorLeft,
        config.splitColorRight,
        config.splitSwap,
        config.splitSwapSpeed,
    ]);

    // ── Fullscreen toggle (element-based so ONLY this div fills the screen)
    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const scrollDuration = `${(11 - config.speed) * 3}s`;

    const blinkAnimation =
        config.blinkMode !== 'off'
            ? `blink-text ${BLINK_DURATION[config.blinkMode]} step-start infinite`
            : undefined;

    const marqueeAnimation =
        config.direction === 'left'
            ? `marquee-left ${scrollDuration} linear infinite`
            : `marquee-right ${scrollDuration} linear infinite`;

    const displayText = useMemo(
        () =>
            `${config.text}${config.separator}${config.text}${config.separator}${config.text}`,
        [config.text, config.separator]
    );

    const isSplit = config.backgroundMode === 'split';

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden flex items-center select-none"
            style={{
                backgroundColor: isSplit ? undefined : config.backgroundColor,
                minHeight: isFullscreen ? undefined : '220px',
                // When fullscreen, browser handles 100vw × 100vh automatically
                height: isFullscreen ? '100%' : undefined,
                width: '100%',
            }}
        >
            {/* Inject keyframe animations */}
            <style>{`
                @keyframes marquee-left {
                    from { transform: translateX(100vw); }
                    to   { transform: translateX(-100%); }
                }
                @keyframes marquee-right {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(100vw); }
                }
                @keyframes blink-text {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0; }
                }
                /* Element fullscreen — fill viewport completely */
                :fullscreen { width: 100% !important; height: 100% !important; }
                :-webkit-full-screen { width: 100% !important; height: 100% !important; }
            `}</style>

            {/* Split background — absolutely fills the container */}
            {isSplit && (
                <div className="absolute inset-0 flex">
                    <div
                        ref={leftHalfRef}
                        className="flex-1"
                        style={{ backgroundColor: config.splitColorLeft }}
                    />
                    <div
                        ref={rightHalfRef}
                        className="flex-1"
                        style={{ backgroundColor: config.splitColorRight }}
                    />
                </div>
            )}

            {/* Running text — sits above split background */}
            <div
                className="relative whitespace-nowrap z-10"
                style={{
                    animation: blinkAnimation
                        ? `${marqueeAnimation}, ${blinkAnimation}`
                        : marqueeAnimation,
                    fontSize: `${config.fontSize}px`,
                    fontWeight: config.fontWeight,
                    fontFamily: FONT_FAMILIES[config.fontFamily],
                    color: config.textColor,
                    paddingLeft: '4rem',
                }}
            >
                {displayText}
            </div>

            {/* Fullscreen toggle */}
            <button
                onClick={handleToggleFullscreen}
                className="absolute top-3 right-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
                {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                ) : (
                    <Maximize2 className="w-5 h-5" />
                )}
            </button>
        </div>
    );
}
