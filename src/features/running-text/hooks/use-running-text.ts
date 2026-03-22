'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { RunningTextConfig } from '../types';

const DEFAULT_CONFIG: RunningTextConfig = {
    text: 'Running Text — Edit me!',
    textAlign: 'center',
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
    backgroundMode: 'solid',
    splitColorLeft: '#000000',
    splitColorRight: '#ff0000',
    splitSwap: false,
    splitSwapSpeed: 500,
    blinkMode: 'off',
    separator: '   ✦   ',
    isSynced: false,
    syncStartTime: null,
    syncOffset: 0,
};

export function useRunningText() {
    const searchParams = useSearchParams();

    // Load config from URL on mount using useState initializer
    const [config, setConfig] = useState<RunningTextConfig>(() => {
        if (!searchParams || searchParams.toString() === '') {
            return DEFAULT_CONFIG;
        }

        try {
            const loadedConfig: Partial<RunningTextConfig> = {};
            const params = searchParams;
            
            // Helper to safely parse numbers
            const getNum = (key: string) => {
                const val = params.get(key);
                return val ? Number(val) : undefined;
            };

            // Helper to safely parse strings
            const getStr = (key: string) => params.get(key) || undefined;
            
            // Helper to safely parse booleans
            const getBool = (key: string) => params.get(key) === 'true';

            if (params.get('text')) loadedConfig.text = getStr('text');
            if (params.get('textAlign')) loadedConfig.textAlign = getStr('textAlign') as RunningTextConfig['textAlign'];
            if (params.get('direction')) loadedConfig.direction = getStr('direction') as RunningTextConfig['direction'];
            if (params.get('speed')) loadedConfig.speed = getNum('speed');
            if (params.get('fontSize')) loadedConfig.fontSize = getNum('fontSize');
            if (params.get('fontWeight')) loadedConfig.fontWeight = getStr('fontWeight') as RunningTextConfig['fontWeight'];
            if (params.get('fontFamily')) loadedConfig.fontFamily = getStr('fontFamily') as RunningTextConfig['fontFamily'];
            if (params.get('textColor')) loadedConfig.textColor = getStr('textColor');
            if (params.get('backgroundColor')) loadedConfig.backgroundColor = getStr('backgroundColor');
            if (params.get('strobeMode')) loadedConfig.strobeMode = getStr('strobeMode') as RunningTextConfig['strobeMode'];
            if (params.get('strobeSpeed')) loadedConfig.strobeSpeed = getNum('strobeSpeed');
            if (params.get('strobeColor1')) loadedConfig.strobeColor1 = getStr('strobeColor1');
            if (params.get('strobeColor2')) loadedConfig.strobeColor2 = getStr('strobeColor2');
            if (params.get('backgroundMode')) loadedConfig.backgroundMode = getStr('backgroundMode') as RunningTextConfig['backgroundMode'];
            if (params.get('splitColorLeft')) loadedConfig.splitColorLeft = getStr('splitColorLeft');
            if (params.get('splitColorRight')) loadedConfig.splitColorRight = getStr('splitColorRight');
            if (params.get('splitSwap')) loadedConfig.splitSwap = getBool('splitSwap');
            if (params.get('splitSwapSpeed')) loadedConfig.splitSwapSpeed = getNum('splitSwapSpeed');
            if (params.get('blinkMode')) loadedConfig.blinkMode = getStr('blinkMode') as RunningTextConfig['blinkMode'];
            if (params.get('separator')) loadedConfig.separator = getStr('separator');
            // Sync settings
            if (params.get('isSynced')) loadedConfig.isSynced = getBool('isSynced');
            // Don't sync absolute timestamps (syncStartTime) as they might be stale
            // But we sync the offset
            if (params.get('syncOffset')) loadedConfig.syncOffset = getNum('syncOffset');

            return { ...DEFAULT_CONFIG, ...loadedConfig };
        } catch (e) {
            console.error('Failed to parse config from URL', e);
            return DEFAULT_CONFIG;
        }
    });

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Clean up URL without reload to keep it clean
    useEffect(() => {
        if (searchParams && searchParams.toString()) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

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

    // Generate shareable URL
    const getShareUrl = useCallback(() => {
        const params = new URLSearchParams();
        // Only add non-default values to keep URL short(er)
        Object.entries(config).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'syncStartTime') {
                params.set(key, String(value));
            }
        });
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }, [config]);

    return {
        config,
        isFullscreen,
        updateConfig,
        resetConfig,
        getShareUrl,
    };
}
