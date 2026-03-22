'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RunningTextConfig } from '../types';

const DEFAULT_CONFIG: RunningTextConfig = {
    text: 'Running Text — Edit me!',
    direction: 'left',
    speed: 5,
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'sans',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    strobeMode: 'off',
    strobeSpeed: 200,
    strobeColor1: '#ff0000',
    strobeColor2: '#ffffff',
    blinkMode: 'off',
    separator: '   ✦   ',
};

export function useRunningText() {
    const [config, setConfig] = useState<RunningTextConfig>(DEFAULT_CONFIG);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const updateConfig = useCallback((updates: Partial<RunningTextConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
    }, []);

    // Drive isFullscreen from the browser's fullscreenchange event so it's always in sync
    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen?.();
        } else {
            await document.exitFullscreen?.();
        }
        // isFullscreen is updated via the fullscreenchange listener above
    }, []);

    return {
        config,
        isFullscreen,
        updateConfig,
        resetConfig,
        toggleFullscreen,
    };
}
