'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
    const textRef = useRef<HTMLDivElement>(null);
    const leftHalfRef = useRef<HTMLDivElement>(null);
    const rightHalfRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    const [lastNonZeroSpeed, setLastNonZeroSpeed] = useState<number>(config.speed || 5);
    const [prevSpeed, setPrevSpeed] = useState(config.speed);

    // Sync state to props (recommended pattern to avoid set-state-in-effect)
    if (config.speed !== prevSpeed) {
        setPrevSpeed(config.speed);
        if (config.speed > 0) {
            setLastNonZeroSpeed(config.speed);
        }
    }

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

    // ── Fullscreen toggle
    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    // ── JS Animation for Sync ─────────────────────────────────────────────
    useEffect(() => {
        if (!config.isSynced) {
            if (textRef.current) textRef.current.style.transform = '';
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const animate = () => {
            const el = textRef.current;
            if (!el) return;

            const now = Date.now();
            const startTime = config.syncStartTime || now;
            const elapsed = now - startTime - config.syncOffset;

            if (elapsed < 0) {
                el.style.transform = `translateX(${config.direction === 'left' ? '100vw' : '-100%'})`;
                requestRef.current = requestAnimationFrame(animate);
                return;
            }

            if (config.speed === 0) {
                const containerWidth = containerRef.current?.clientWidth || 0;
                const textWidth = el.scrollWidth;
                const x = config.direction === 'left' ? containerWidth : -textWidth;
                el.style.transform = `translateX(${x}px)`;
                requestRef.current = requestAnimationFrame(animate);
                return;
            }

            const pxPerSec = config.speed * 50;
            const pxPerMs = pxPerSec / 1000;
            const containerWidth = containerRef.current?.clientWidth || 0;
            const textWidth = el.scrollWidth;
            const totalDistance = containerWidth + textWidth;
            const travel = (elapsed * pxPerMs) % totalDistance;

            if (config.direction === 'left') {
                const x = containerWidth - travel;
                el.style.transform = `translateX(${x}px)`;
            } else {
                const x = -textWidth + travel;
                el.style.transform = `translateX(${x}px)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [
        config.isSynced,
        config.syncStartTime,
        config.syncOffset,
        config.speed,
        config.direction,
        config.text,
        config.fontSize
    ]);

    const effectiveSpeed = config.speed === 0 ? lastNonZeroSpeed : config.speed;
    const scrollDuration = `${(11 - effectiveSpeed) * 3}s`;

    const marqueeName = config.direction === 'left' ? 'marquee-left' : 'marquee-right';
    const blinkName = config.blinkMode !== 'off' ? 'blink-text' : null;

    const animNames: string[] = [];
    const animDurations: string[] = [];
    const animTimings: string[] = [];
    const animIterCounts: string[] = [];
    const animPlayStates: string[] = [];

    if (!config.isSynced) {
        animNames.push(marqueeName);
        animDurations.push(scrollDuration);
        animTimings.push('linear');
        animIterCounts.push('infinite');
        animPlayStates.push(config.speed === 0 ? 'paused' : 'running');
    }

    if (blinkName) {
        animNames.push(blinkName);
        animDurations.push(BLINK_DURATION[config.blinkMode]);
        animTimings.push('step-start');
        animIterCounts.push('infinite');
        animPlayStates.push('running');
    }

    const textBlocks = useMemo(
        () => [config.text, config.text, config.text],
        [config.text]
    );

    const isSplit = config.backgroundMode === 'split';

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden flex items-center select-none"
            style={{
                backgroundColor: isSplit ? undefined : config.backgroundColor,
                minHeight: isFullscreen ? undefined : '220px',
                height: isFullscreen ? '100%' : undefined,
                width: '100%',
            }}
        >
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
                :fullscreen { width: 100% !important; height: 100% !important; }
                :-webkit-full-screen { width: 100% !important; height: 100% !important; }
            `}</style>

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

            <div
                ref={textRef}
                className="relative whitespace-nowrap z-10 flex flex-row items-center"
                style={{
                    animationName: animNames.join(', ') || 'none',
                    animationDuration: animDurations.join(', '),
                    animationTimingFunction: animTimings.join(', '),
                    animationIterationCount: animIterCounts.join(', '),
                    animationPlayState: animPlayStates.join(', '),
                    fontSize: `${config.fontSize}px`,
                    fontWeight: config.fontWeight,
                    fontFamily: FONT_FAMILIES[config.fontFamily],
                    color: config.textColor,
                    paddingLeft: '4rem',
                    willChange: 'transform',
                }}
            >
                {textBlocks.map((text, i) => (
                    <div key={i} className="flex flex-row items-center">
                        <div
                            style={{
                                whiteSpace: 'pre',
                                textAlign: config.textAlign,
                                display: 'inline-block',
                            }}
                        >
                            {text}
                        </div>
                        {i < textBlocks.length - 1 && (
                            <div className="whitespace-pre">{config.separator}</div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleToggleFullscreen}
                className="absolute top-3 right-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
        </div>
    );
}
