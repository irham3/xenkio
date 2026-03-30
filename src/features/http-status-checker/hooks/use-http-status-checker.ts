'use client';

import { useState, useCallback } from 'react';
import type { HttpStatusCheckerState } from '../types';
import { checkUrlStatus, isValidUrl, normalizeUrl } from '../lib/checker-utils';

const DEFAULT_STATE: HttpStatusCheckerState = {
    url: '',
    result: null,
    status: 'idle',
    error: null,
};

export function useHttpStatusChecker() {
    const [state, setState] = useState<HttpStatusCheckerState>(DEFAULT_STATE);

    const setUrl = useCallback((url: string) => {
        setState(prev => ({ ...prev, url }));
    }, []);

    const check = useCallback(async (rawUrl?: string) => {
        const targetUrl = (rawUrl ?? state.url).trim();

        if (!targetUrl) {
            setState(prev => ({ ...prev, error: 'Please enter a URL to check.', status: 'error' }));
            return;
        }

        const normalized = normalizeUrl(targetUrl);

        if (!isValidUrl(normalized)) {
            setState(prev => ({
                ...prev,
                error: 'Invalid URL. Please enter a valid URL (e.g., https://example.com).',
                status: 'error',
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            url: targetUrl,
            status: 'loading',
            error: null,
            result: null,
        }));

        try {
            const result = await checkUrlStatus(targetUrl);
            setState(prev => ({ ...prev, result, status: 'success', error: null }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                result: null,
                status: 'error',
                error: err instanceof Error ? err.message : 'Failed to check URL status.',
            }));
        }
    }, [state.url]);

    const reset = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    return { state, setUrl, check, reset };
}
