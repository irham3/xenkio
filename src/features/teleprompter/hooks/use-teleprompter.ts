'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TeleprompterConfig, TeleprompterState, TeleprompterMode } from '../types';
import { splitIntoSegments } from '../lib/teleprompter-utils';

const DEFAULT_CONFIG: TeleprompterConfig = {
    script: '',
    mode: 'setup',
    fontSize: 42,
    fontWeight: 'normal',
    fontFamily: 'sans',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    scrollSpeed: 3,
    mirror: false,
    segmentType: 'smart',
    lineSpacing: 1.6,
};

/** localStorage size guard: skip saving if serialised value is too large (> 4MB). */
function safeSaveToStorage(key: string, value: string): void {
    try {
        if (value.length > 4 * 1024 * 1024) {
            // Script is huge — skip persisting to avoid QuotaExceededError
            return;
        }
        localStorage.setItem(key, value);
    } catch {
        // QuotaExceededError or SecurityError — silently ignore
    }
}

export function useTeleprompter() {
    const [config, setConfig] = useState<TeleprompterConfig>(() => {
        if (typeof window === 'undefined') return DEFAULT_CONFIG;
        try {
            const saved = localStorage.getItem('xenkio-teleprompter-config');
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<TeleprompterConfig>;
                return { ...DEFAULT_CONFIG, ...parsed, mode: 'setup' };
            }
        } catch {
            // ignore corrupt data
        }
        return DEFAULT_CONFIG;
    });

    const [state, setState] = useState<TeleprompterState>({
        isPlaying: false,
        currentSegmentIndex: 0,
        segments: [],
        isFullscreen: false,
        countdown: null,
    });

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const scrollPosRef = useRef<number>(0);
    /** Timestamp of the previous animation frame — used for delta-time calculation. */
    const lastFrameTsRef = useRef<number | null>(null);
    /** Flag to detect if user is manually scrolling during playback. */
    const manualScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isProgrammaticScrollRef = useRef(false);

    // Persist config (excluding mode so it always opens in setup)
    useEffect(() => {
        const toSave = { ...config, mode: 'setup' as TeleprompterMode };
        safeSaveToStorage('xenkio-teleprompter-config', JSON.stringify(toSave));
    }, [config]);

    // Fullscreen listener
    useEffect(() => {
        const onFsChange = () => {
            setState((prev) => ({ ...prev, isFullscreen: Boolean(document.fullscreenElement) }));
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const updateConfig = useCallback((partial: Partial<TeleprompterConfig>) => {
        setConfig((prev) => ({ ...prev, ...partial }));
    }, []);

    // Start teleprompter mode
    const startTeleprompter = useCallback(() => {
        scrollPosRef.current = 0;
        lastFrameTsRef.current = null;
        setConfig((prev) => ({ ...prev, mode: 'teleprompter' }));
        setState((prev) => ({ ...prev, isPlaying: false, countdown: null }));
    }, []);

    // Start reading mode
    const startReading = useCallback(() => {
        const segments = splitIntoSegments(config.script, config.segmentType);
        setConfig((prev) => ({ ...prev, mode: 'reading' }));
        setState((prev) => ({ ...prev, currentSegmentIndex: 0, segments }));
    }, [config.script, config.segmentType]);

    // Back to setup
    const backToSetup = useCallback(() => {
        if (animFrameRef.current != null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        lastFrameTsRef.current = null;
        setConfig((prev) => ({ ...prev, mode: 'setup' }));
        setState((prev) => ({ ...prev, isPlaying: false, currentSegmentIndex: 0, segments: [], countdown: null }));
    }, []);

    // Play/pause teleprompter scroll
    const togglePlay = useCallback(() => {
        setState((prev) => {
            if (prev.isPlaying || prev.countdown !== null) {
                lastFrameTsRef.current = null;
                return { ...prev, isPlaying: false, countdown: null };
            }
            // Start countdown ONLY if at the very beginning, otherwise resume immediately
            if (scrollPosRef.current <= 5) {
                return { ...prev, countdown: 3 };
            } else {
                lastFrameTsRef.current = null;
                return { ...prev, isPlaying: true };
            }
        });
    }, []);

    useEffect(() => {
        if (state.countdown === null) return;

        const timer = setTimeout(() => {
            setState((prev) => {
                if (prev.countdown === null) return prev;
                if (prev.countdown > 1) {
                    return { ...prev, countdown: prev.countdown - 1 };
                } else {
                    // Transition from 1 to null (starting playback)
                    lastFrameTsRef.current = null;
                    return { ...prev, countdown: null, isPlaying: true };
                }
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [state.countdown]);

    // Reset scroll position to top
    const resetScroll = useCallback(() => {
        scrollPosRef.current = 0;
        lastFrameTsRef.current = null;
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        setState((prev) => ({ ...prev, isPlaying: false, countdown: null }));
    }, []);

    // ─── Frame-rate independent scroll animation ──────────────────────────────
    // Target speed is expressed in px/second, calibrated so that:
    //   speed 1 → ~24 px/s (very slow)
    //   speed 5 → ~72 px/s (comfortable)
    //   speed 10 → ~144 px/s (fast)
    useEffect(() => {
        if (config.mode !== 'teleprompter' || !state.isPlaying) {
            if (animFrameRef.current != null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            lastFrameTsRef.current = null;
            return;
        }

        const el = scrollRef.current;
        if (!el) return;

        const PX_PER_SECOND = config.scrollSpeed * 14.4; // speed 1 = 14.4 px/s, 10 = 144 px/s

        const animate = (timestamp: number) => {
            if (!scrollRef.current) return;

            // Delta-time: how many milliseconds since last frame
            const delta = lastFrameTsRef.current != null ? timestamp - lastFrameTsRef.current : 0;
            lastFrameTsRef.current = timestamp;

            const pxThisFrame = (PX_PER_SECOND * delta) / 1000;
            scrollPosRef.current += pxThisFrame;

            isProgrammaticScrollRef.current = true;
            scrollRef.current.scrollTop = scrollPosRef.current;

            const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
            if (scrollPosRef.current >= maxScroll) {
                setState((prev) => ({ ...prev, isPlaying: false }));
                return;
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animFrameRef.current != null) cancelAnimationFrame(animFrameRef.current);
        };
    }, [config.mode, state.isPlaying, config.scrollSpeed]);

    // Sync scroll pos on manual scroll — auto-pause if user scrolls while playing
    const onScroll = useCallback(() => {
        if (!scrollRef.current) return;

        if (isProgrammaticScrollRef.current) {
            // This scroll event was triggered by our animation — ignore
            isProgrammaticScrollRef.current = false;
            return;
        }

        // User manually scrolled — sync position
        scrollPosRef.current = scrollRef.current.scrollTop;

        // Auto-pause after brief idle (debounced)
        if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
        manualScrollTimerRef.current = setTimeout(() => {
            // Pause after manual scroll so user can reorient
            setState((prev) => (prev.isPlaying || prev.countdown !== null ? { ...prev, isPlaying: false, countdown: null } : prev));
        }, 600);
    }, []);

    // Navigation for reading mode
    const goNext = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentSegmentIndex: Math.min(prev.currentSegmentIndex + 1, Math.max(0, prev.segments.length - 1)),
        }));
    }, []);

    const goPrev = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentSegmentIndex: Math.max(prev.currentSegmentIndex - 1, 0),
        }));
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async (el: HTMLElement | null) => {
        if (!el) return;
        if (!document.fullscreenElement) {
            await el.requestFullscreen().catch(() => null);
        } else {
            await document.exitFullscreen().catch(() => null);
        }
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (manualScrollTimerRef.current) clearTimeout(manualScrollTimerRef.current);
        };
    }, []);

    return {
        config,
        state,
        scrollRef,
        updateConfig,
        startTeleprompter,
        startReading,
        backToSetup,
        togglePlay,
        resetScroll,
        onScroll,
        goNext,
        goPrev,
        toggleFullscreen,
    };
}
