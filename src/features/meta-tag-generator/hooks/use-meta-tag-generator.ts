'use client';

import { useState, useCallback, useMemo } from 'react';
import { MetaTagConfig } from '../types';
import {
    getDefaultConfig,
    configToMetaTags,
} from '../lib/meta-tag-utils';

export function useMetaTagGenerator() {
    const [config, setConfig] = useState<MetaTagConfig>(getDefaultConfig());

    const output = useMemo(() => configToMetaTags(config), [config]);

    const updateField = useCallback(<K extends keyof MetaTagConfig>(field: K, value: MetaTagConfig[K]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    const applyPreset = useCallback((presetConfig: Partial<MetaTagConfig>) => {
        setConfig(prev => ({
            ...getDefaultConfig(),
            title: prev.title,
            description: prev.description,
            keywords: prev.keywords,
            author: prev.author,
            canonical: prev.canonical,
            ogTitle: prev.ogTitle,
            ogDescription: prev.ogDescription,
            ogImage: prev.ogImage,
            ogUrl: prev.ogUrl,
            ogSiteName: prev.ogSiteName,
            twitterSite: prev.twitterSite,
            twitterCreator: prev.twitterCreator,
            twitterTitle: prev.twitterTitle,
            twitterDescription: prev.twitterDescription,
            twitterImage: prev.twitterImage,
            themeColor: prev.themeColor,
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
        a.download = 'meta-tags.html';
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
