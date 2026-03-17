'use client';

import { useCallback, useMemo, useState } from 'react';
import { SitemapGeneratorConfig, SitemapUrlEntry } from '../types';
import {
    clampPriority,
    configToSitemapXml,
    createUrlEntry,
    getDefaultConfig,
} from '../lib/sitemap-utils';

const URL_REVOKE_DELAY_MS = 1000;

export function useSitemapGenerator() {
    const [config, setConfig] = useState<SitemapGeneratorConfig>(getDefaultConfig());
    const [bulkPaths, setBulkPaths] = useState('');

    const output = useMemo(() => configToSitemapXml(config), [config]);

    const updateBaseUrl = useCallback((baseUrl: string) => {
        setConfig((prev) => ({ ...prev, baseUrl }));
    }, []);

    const addUrl = useCallback(() => {
        setConfig((prev) => ({
            ...prev,
            urls: [...prev.urls, createUrlEntry('')],
        }));
    }, []);

    const removeUrl = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            urls: prev.urls.filter((entry) => entry.id !== id),
        }));
    }, []);

    const updateUrl = useCallback(<FieldKey extends keyof SitemapUrlEntry>(
        id: string,
        field: FieldKey,
        value: SitemapUrlEntry[FieldKey],
    ) => {
        setConfig((prev) => ({
            ...prev,
            urls: prev.urls.map((entry) => {
                if (entry.id !== id) {
                    return entry;
                }

                if (field === 'priority') {
                    return {
                        ...entry,
                        priority: clampPriority(Number(value)),
                    };
                }

                return {
                    ...entry,
                    [field]: value,
                };
            }),
        }));
    }, []);

    const importPaths = useCallback(() => {
        const parsedPaths = bulkPaths
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (parsedPaths.length === 0) {
            return;
        }

        setConfig((prev) => ({
            ...prev,
            urls: [...prev.urls, ...parsedPaths.map((path) => createUrlEntry(path))],
        }));
    }, [bulkPaths]);

    const applyPreset = useCallback((paths: string[]) => {
        setConfig((prev) => ({
            ...prev,
            urls: paths.map((path) => createUrlEntry(path)),
        }));
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(getDefaultConfig());
        setBulkPaths('');
    }, []);

    const downloadFile = useCallback(() => {
        const blob = new Blob([output], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS);
    }, [output]);

    return {
        config,
        output,
        bulkPaths,
        setBulkPaths,
        updateBaseUrl,
        addUrl,
        removeUrl,
        updateUrl,
        importPaths,
        applyPreset,
        resetConfig,
        downloadFile,
    };
}
