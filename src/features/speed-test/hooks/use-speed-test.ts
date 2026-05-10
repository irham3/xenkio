'use client';

import { useState, useCallback, useRef } from 'react';
import type { SpeedTestState } from '../types';
import {
    measurePingStats,
    measureDownloadSpeed,
    measureUploadSpeed,
} from '../lib/speed-utils';

const INITIAL_STATE: SpeedTestState = {
    phase: 'idle',
    result: { ping: null, jitter: null, download: null, upload: null },
    progress: 0,
    liveValue: null,
    error: null,
};

export function useSpeedTest() {
    const [state, setState] = useState<SpeedTestState>(INITIAL_STATE);
    const abortControllerRef = useRef<AbortController | null>(null);

    const runTest = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setState({ ...INITIAL_STATE, phase: 'ping' });

        try {
            // Phase 1: Ping
            const { avg: ping, jitter } = await measurePingStats(
                8,
                (done, total, latestMs) => {
                    if (controller.signal.aborted) return;
                    setState(prev => ({
                        ...prev,
                        progress: Math.round((done / total) * 100),
                        liveValue: Math.round(latestMs),
                    }));
                },
                controller.signal,
            );

            if (controller.signal.aborted) return;

            setState(prev => ({
                ...prev,
                result: { ...prev.result, ping, jitter },
                phase: 'download',
                progress: 0,
                liveValue: null,
            }));

            // Phase 2: Download
            const download = await measureDownloadSpeed((pct, mbps) => {
                if (controller.signal.aborted) return;
                setState(prev => ({
                    ...prev,
                    progress: Math.round(pct),
                    liveValue: Math.round(mbps * 10) / 10,
                }));
            }, controller.signal);

            if (controller.signal.aborted) return;

            setState(prev => ({
                ...prev,
                result: { ...prev.result, download },
                phase: 'upload',
                progress: 0,
                liveValue: null,
            }));

            // Phase 3: Upload
            const upload = await measureUploadSpeed((pct, mbps) => {
                if (controller.signal.aborted) return;
                setState(prev => ({
                    ...prev,
                    progress: Math.round(pct),
                    liveValue: Math.round(mbps * 10) / 10,
                }));
            }, controller.signal);

            if (controller.signal.aborted) return;

            setState(prev => ({
                ...prev,
                result: { ...prev.result, upload },
                phase: 'complete',
                progress: 100,
                liveValue: null,
            }));
        } catch (err) {
            if (!controller.signal.aborted) {
                setState(prev => ({
                    ...prev,
                    phase: 'error',
                    error: getSpeedTestErrorMessage(err),
                }));
            }
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, []);

    const reset = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setState(INITIAL_STATE);
    }, []);

    return { state, runTest, reset };
}

function getSpeedTestErrorMessage(err: unknown): string {
    if (err instanceof TypeError) {
        return 'Chrome or an extension blocked the external speed test server. Allow speed.cloudflare.com and try again.';
    }

    return err instanceof Error
        ? err.message
        : 'Speed test failed. Please check your connection and try again.';
}
