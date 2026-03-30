'use client';

import { useState, useCallback } from 'react';
import type { DnsLookupState, DnsRecordType } from '../types';
import { queryDns, isValidDomain } from '../lib/dns-utils';

const DEFAULT_DOMAIN = '';
const DEFAULT_TYPE: DnsRecordType = 'A';

export function useDnsLookup() {
    const [state, setState] = useState<DnsLookupState>({
        records: [],
        status: 'idle',
        error: null,
        domain: DEFAULT_DOMAIN,
        recordType: DEFAULT_TYPE,
    });

    const setDomain = useCallback((domain: string) => {
        setState(prev => ({ ...prev, domain }));
    }, []);

    const setRecordType = useCallback((recordType: DnsRecordType) => {
        setState(prev => ({ ...prev, recordType }));
    }, []);

    const lookup = useCallback(async (domain?: string, recordType?: DnsRecordType) => {
        const targetDomain = (domain ?? state.domain).trim();
        const targetType = recordType ?? state.recordType;

        if (!targetDomain) {
            setState(prev => ({ ...prev, error: 'Please enter a domain name.', status: 'error' }));
            return;
        }

        if (!isValidDomain(targetDomain)) {
            setState(prev => ({
                ...prev,
                error: 'Invalid domain name. Please enter a valid domain (e.g., example.com).',
                status: 'error',
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            status: 'loading',
            error: null,
            records: [],
            domain: targetDomain,
            recordType: targetType,
        }));

        try {
            const records = await queryDns(targetDomain, targetType);
            setState(prev => ({
                ...prev,
                records,
                status: 'success',
                error: null,
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                records: [],
                status: 'error',
                error: err instanceof Error ? err.message : 'DNS lookup failed. Please try again.',
            }));
        }
    }, [state.domain, state.recordType]);

    const reset = useCallback(() => {
        setState({
            records: [],
            status: 'idle',
            error: null,
            domain: DEFAULT_DOMAIN,
            recordType: DEFAULT_TYPE,
        });
    }, []);

    return {
        state,
        setDomain,
        setRecordType,
        lookup,
        reset,
    };
}
