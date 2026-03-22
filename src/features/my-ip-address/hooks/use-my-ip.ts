'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IpState, IpInfo } from '../types';

const IP_API_URL = 'https://ipinfo.io/json';

export function useMyIp() {
    const [state, setState] = useState<IpState>({
        info: null,
        status: 'loading',
        error: null,
    });

    const fetchIp = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'loading', error: null }));
        try {
            const response = await fetch(IP_API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const data: IpInfo = await response.json();
            setState({ info: data, status: 'success', error: null });
        } catch (err) {
            setState({
                info: null,
                status: 'error',
                error: err instanceof Error ? err.message : 'Failed to fetch IP information',
            });
        }
    }, []);

    useEffect(() => {
        fetchIp();
    }, [fetchIp]);

    return { state, refresh: fetchIp };
}
