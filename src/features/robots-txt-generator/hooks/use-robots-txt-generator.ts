'use client';

import { useState, useCallback, useMemo } from 'react';
import { RobotRule, RobotsTxtConfig } from '../types';
import {
    getDefaultConfig,
    createDefaultRule,
    configToRobotsTxt,
    generateId,
} from '../lib/robots-txt-utils';

export function useRobotsTxtGenerator() {
    const [config, setConfig] = useState<RobotsTxtConfig>(getDefaultConfig());

    const output = useMemo(() => configToRobotsTxt(config), [config]);

    const addRule = useCallback(() => {
        const newRule = createDefaultRule();
        setConfig(prev => ({
            ...prev,
            rules: [...prev.rules, newRule],
        }));
        return newRule.id;
    }, []);

    const removeRule = useCallback((ruleId: string) => {
        setConfig(prev => ({
            ...prev,
            rules: prev.rules.filter(r => r.id !== ruleId),
        }));
    }, []);

    const updateRule = useCallback((ruleId: string, updates: Partial<RobotRule>) => {
        setConfig(prev => ({
            ...prev,
            rules: prev.rules.map(r =>
                r.id === ruleId ? { ...r, ...updates } : r
            ),
        }));
    }, []);

    const addPathToRule = useCallback((ruleId: string, type: 'allow' | 'disallow') => {
        setConfig(prev => ({
            ...prev,
            rules: prev.rules.map(r =>
                r.id === ruleId ? { ...r, [type]: [...r[type], ''] } : r
            ),
        }));
    }, []);

    const updatePathInRule = useCallback((ruleId: string, type: 'allow' | 'disallow', index: number, value: string) => {
        setConfig(prev => ({
            ...prev,
            rules: prev.rules.map(r =>
                r.id === ruleId
                    ? { ...r, [type]: r[type].map((p, i) => i === index ? value : p) }
                    : r
            ),
        }));
    }, []);

    const removePathFromRule = useCallback((ruleId: string, type: 'allow' | 'disallow', index: number) => {
        setConfig(prev => ({
            ...prev,
            rules: prev.rules.map(r =>
                r.id === ruleId
                    ? { ...r, [type]: r[type].filter((_, i) => i !== index) }
                    : r
            ),
        }));
    }, []);

    const addSitemap = useCallback(() => {
        setConfig(prev => ({
            ...prev,
            sitemaps: [...prev.sitemaps, ''],
        }));
    }, []);

    const updateSitemap = useCallback((index: number, value: string) => {
        setConfig(prev => ({
            ...prev,
            sitemaps: prev.sitemaps.map((s, i) => i === index ? value : s),
        }));
    }, []);

    const removeSitemap = useCallback((index: number) => {
        setConfig(prev => ({
            ...prev,
            sitemaps: prev.sitemaps.filter((_, i) => i !== index),
        }));
    }, []);

    const setHost = useCallback((host: string) => {
        setConfig(prev => ({ ...prev, host }));
    }, []);

    const applyPreset = useCallback((presetConfig: RobotsTxtConfig) => {
        const newRules = presetConfig.rules.map(r => ({ ...r, id: generateId() }));
        setConfig({
            ...presetConfig,
            rules: newRules,
        });
        return newRules.map(r => r.id);
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(getDefaultConfig());
    }, []);

    const downloadFile = useCallback(() => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'robots.txt';
        a.click();
        URL.revokeObjectURL(url);
    }, [output]);

    return {
        config,
        output,
        addRule,
        removeRule,
        updateRule,
        addPathToRule,
        updatePathInRule,
        removePathFromRule,
        addSitemap,
        updateSitemap,
        removeSitemap,
        setHost,
        applyPreset,
        resetConfig,
        downloadFile,
    };
}
