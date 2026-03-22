'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { RunningTextConfig } from '../types';

interface RunningTextDisplayProps {
    config: RunningTextConfig;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
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

export function RunningTextDisplay({
    config,
    isFullscreen,
    onToggleFullscreen,
}: RunningTextDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Strobe effect — direct DOM manipulation avoids setState-in-effect lint rule
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

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
        config.strobeMode,
        config.strobeSpeed,
        config.strobeColor1,
        config.strobeColor2,
        config.backgroundColor,
    ]);

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

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden flex items-center select-none"
            style={{
                backgroundColor: config.backgroundColor,
                minHeight: isFullscreen ? '100vh' : '220px',
                height: isFullscreen ? '100vh' : undefined,
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
            `}</style>

            {/* Running text */}
            <div
                className="whitespace-nowrap"
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
                onClick={onToggleFullscreen}
                className="absolute top-3 right-3 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
