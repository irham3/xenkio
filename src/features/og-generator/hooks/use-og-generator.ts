'use client';

import { useCallback, useMemo, useState } from 'react';
import { OpenGraphConfig } from '../types';
import { configToMetaTags, getDefaultConfig } from '../lib/og-utils';

export function useOpenGraphGenerator() {
    const [config, setConfig] = useState<OpenGraphConfig>(getDefaultConfig());

    const output = useMemo(() => configToMetaTags(config), [config]);

    const updateField = useCallback(<K extends keyof OpenGraphConfig>(field: K, value: OpenGraphConfig[K]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    const applyPreset = useCallback((presetConfig: Partial<OpenGraphConfig>) => {
        setConfig(prev => ({
            ...getDefaultConfig(),
            title: prev.title,
            description: prev.description,
            url: prev.url,
            image: prev.image,
            imageAlt: prev.imageAlt,
            siteName: prev.siteName,
            twitterSite: prev.twitterSite,
            twitterCreator: prev.twitterCreator,
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
        a.download = 'open-graph-tags.html';
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
