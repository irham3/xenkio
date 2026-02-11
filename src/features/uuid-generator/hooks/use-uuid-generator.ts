
'use client';

import { useState, useCallback, useEffect } from 'react';
import { UUIDConfig, UUIDItem } from '../types';
import { generateUUID } from '../lib/uuid-utils';

const STORAGE_KEY = 'xenkio-uuid-history';
const MAX_HISTORY = 50;

export function useUUIDGenerator() {
    const [config, setConfig] = useState<UUIDConfig>({
        version: 'v4',
        count: 1,
        uppercase: false,
        hyphens: true,
        namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // DNS
        name: 'xenkio.com'
    });

    const [uuids, setUuids] = useState<string[]>([]);
    const [history, setHistory] = useState<UUIDItem[]>([]);

    // Handle history persistence
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setTimeout(() => setHistory(parsed), 0);
            } catch (e) {
                console.error('Failed to parse UUID history', e);
            }
        }

        // Initial generation removed as per user request
    }, []);

    // Save history to localStorage
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
        }
    }, [history]);

    const generate = useCallback(() => {
        const newUuids = generateUUID(config);
        setUuids(newUuids);

        const newHistoryItems: UUIDItem[] = newUuids.map(val => ({
            id: Math.random().toString(36).substring(2, 9),
            value: val,
            version: config.version,
            timestamp: Date.now()
        }));

        setHistory(prev => [...newHistoryItems, ...prev].slice(0, MAX_HISTORY));
    }, [config]);

    const updateConfig = (newConfig: Partial<UUIDConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        config,
        uuids,
        history,
        generate,
        updateConfig,
        clearHistory
    };
}
