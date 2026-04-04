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
    segmentType: 'paragraph',
    lineSpacing: 1.6,
};

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
            // ignore
        }
        return DEFAULT_CONFIG;
    });

    const [state, setState] = useState<TeleprompterState>({
        isPlaying: false,
        currentSegmentIndex: 0,
        segments: [],
        isFullscreen: false,
    });

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const scrollPosRef = useRef<number>(0);

    // Persist config (excluding mode so it always opens in setup)
    useEffect(() => {
        try {
            const toSave = { ...config, mode: 'setup' as TeleprompterMode };
            localStorage.setItem('xenkio-teleprompter-config', JSON.stringify(toSave));
        } catch {
            // ignore
        }
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
        setConfig((prev) => ({ ...prev, mode: 'teleprompter' }));
        setState((prev) => ({ ...prev, isPlaying: false }));
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
        setConfig((prev) => ({ ...prev, mode: 'setup' }));
        setState((prev) => ({ ...prev, isPlaying: false, currentSegmentIndex: 0, segments: [] }));
    }, []);

    // Play/pause teleprompter scroll
    const togglePlay = useCallback(() => {
        setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }, []);

    // Reset scroll position to top
    const resetScroll = useCallback(() => {
        scrollPosRef.current = 0;
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        setState((prev) => ({ ...prev, isPlaying: false }));
    }, []);

    // Animate scroll for teleprompter mode
    useEffect(() => {
        if (config.mode !== 'teleprompter' || !state.isPlaying) {
            if (animFrameRef.current != null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            return;
        }

        const el = scrollRef.current;
        if (!el) return;

        const pxPerFrame = config.scrollSpeed * 0.4;

        const animate = () => {
            if (!scrollRef.current) return;
            scrollPosRef.current += pxPerFrame;
            scrollRef.current.scrollTop = scrollPosRef.current;

            if (scrollPosRef.current >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
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

    // Sync scroll pos on manual scroll
    const onScroll = useCallback(() => {
        if (scrollRef.current) {
            scrollPosRef.current = scrollRef.current.scrollTop;
        }
    }, []);

    // Navigation for reading mode
    const goNext = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentSegmentIndex: Math.min(prev.currentSegmentIndex + 1, prev.segments.length - 1),
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
