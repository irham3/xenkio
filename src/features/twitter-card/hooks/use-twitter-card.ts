'use client';

import { useCallback, useMemo, useState } from 'react';
import { TwitterCardConfig } from '../types';
import { configToMetaTags, getDefaultConfig } from '../lib/twitter-card-utils';

export function useTwitterCardGenerator() {
    const [config, setConfig] = useState<TwitterCardConfig>(getDefaultConfig());

    const output = useMemo(() => configToMetaTags(config), [config]);

    const updateField = useCallback(<K extends keyof TwitterCardConfig>(field: K, value: TwitterCardConfig[K]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    const applyPreset = useCallback((presetConfig: Partial<TwitterCardConfig>) => {
        setConfig(prev => ({
            ...getDefaultConfig(),
            title: prev.title,
            description: prev.description,
            siteUsername: prev.siteUsername,
            creatorUsername: prev.creatorUsername,
            image: prev.image,
            imageAlt: prev.imageAlt,
            ...presetConfig,
        }));
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(getDefaultConfig());
    }, []);

    const downloadFile = useCallback(() => {
        const blob = new Blob([output], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'twitter-card-tags.html';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, [output]);

    return {
        config,
        output,
        updateField,
        applyPreset,
        resetConfig,
        downloadFile,
    };
}
