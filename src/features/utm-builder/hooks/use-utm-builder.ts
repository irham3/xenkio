'use client';

import { useCallback, useMemo, useState } from 'react';
import { UTMParams, UTMState } from '../types';
import { buildUtmUrl, getDefaultParams, hasRequiredParams, toQueryOnly } from '../lib/utm-utils';

const DEFAULT_BASE_URL = 'https://example.com/landing-page';

export function useUtmBuilder() {
    const [state, setState] = useState<UTMState>({
        baseUrl: DEFAULT_BASE_URL,
        params: getDefaultParams(),
    });

    const fullUrl = useMemo(() => buildUtmUrl(state.baseUrl, state.params), [state.baseUrl, state.params]);

    const queryString = useMemo(() => toQueryOnly(state.params), [state.params]);

    const isReady = useMemo(() => Boolean(fullUrl && hasRequiredParams(state.params)), [fullUrl, state.params]);

    const updateBaseUrl = useCallback((value: string) => {
        setState(prev => ({
            ...prev,
            baseUrl: value,
        }));
    }, []);

    const updateParam = useCallback((field: keyof UTMParams, value: string) => {
        setState(prev => ({
            ...prev,
            params: {
                ...prev.params,
                [field]: value,
            },
        }));
    }, []);

    const applyPreset = useCallback((preset: Partial<UTMParams>) => {
        setState(prev => ({
            ...prev,
            params: {
                ...prev.params,
                ...preset,
            },
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            baseUrl: DEFAULT_BASE_URL,
            params: getDefaultParams(),
        });
    }, []);

    const download = useCallback(() => {
        if (!fullUrl) return;

        const lines = [
            `Base URL: ${state.baseUrl.trim()}`,
            `Generated URL: ${fullUrl}`,
            '',
            'UTM Parameters:',
            `utm_source=${state.params.source.trim()}`,
            `utm_medium=${state.params.medium.trim()}`,
            `utm_campaign=${state.params.campaign.trim()}`,
            `utm_term=${state.params.term.trim()}`,
            `utm_content=${state.params.content.trim()}`,
        ];

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = 'utm-url.txt';
        anchor.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, [fullUrl, state.baseUrl, state.params]);

    return {
        state,
        fullUrl,
        queryString,
        isReady,
        updateBaseUrl,
        updateParam,
        applyPreset,
        reset,
        download,
    };
}
