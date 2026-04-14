'use client';

import { useState, useCallback } from 'react';
import { parseUserAgent } from '../lib/ua-parser';
import type { ParsedUserAgent } from '../types';

export function useUserAgent() {
    const [parsed, setParsed] = useState<ParsedUserAgent | null>(() => {
        if (typeof navigator !== 'undefined') {
            return parseUserAgent(navigator.userAgent);
        }
        return null;
    });
    const [customUa, setCustomUa] = useState(() =>
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
    const [isCustomMode, setIsCustomMode] = useState(false);

    const detectFromBrowser = useCallback(() => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        setParsed(parseUserAgent(ua));
        setCustomUa(ua);
        setIsCustomMode(false);
    }, []);

    const parseCustom = useCallback((ua: string) => {
        setCustomUa(ua);
        setIsCustomMode(true);
        if (ua.trim()) {
            setParsed(parseUserAgent(ua));
        } else {
            setParsed(null);
        }
    }, []);

    return {
        parsed,
        customUa,
        isCustomMode,
        detectFromBrowser,
        parseCustom,
    };
}
