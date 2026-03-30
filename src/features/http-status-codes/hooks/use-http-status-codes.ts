'use client';

import { useState, useMemo } from 'react';
import { HTTP_STATUS_CODES } from '../constants';
import { StatusClass, StatusFilter, HttpStatusCode } from '../types';

const STATUS_CLASSES: StatusClass[] = ['1xx', '2xx', '3xx', '4xx', '5xx'];

export function useHttpStatusCodes() {
    const [filter, setFilter] = useState<StatusFilter>({
        search: '',
        selectedClass: 'all',
    });

    const filtered = useMemo<HttpStatusCode[]>(() => {
        const term = filter.search.trim().toLowerCase();
        return HTTP_STATUS_CODES.filter((s) => {
            const matchesClass =
                filter.selectedClass === 'all' || s.class === filter.selectedClass;
            const matchesSearch =
                !term ||
                s.name.toLowerCase().includes(term) ||
                String(s.code).includes(term) ||
                s.description.toLowerCase().includes(term);
            return matchesClass && matchesSearch;
        });
    }, [filter]);

    const grouped = useMemo<Record<StatusClass, HttpStatusCode[]>>(() => {
        const init = STATUS_CLASSES.reduce<Record<StatusClass, HttpStatusCode[]>>(
            (acc, cls) => {
                acc[cls] = [];
                return acc;
            },
            {} as Record<StatusClass, HttpStatusCode[]>
        );
        return filtered.reduce((acc, code) => {
            acc[code.class].push(code);
            return acc;
        }, init);
    }, [filtered]);

    const counts = useMemo<Record<StatusClass, number>>(() => {
        return STATUS_CLASSES.reduce<Record<StatusClass, number>>(
            (acc, cls) => {
                acc[cls] = HTTP_STATUS_CODES.filter((s) => s.class === cls).length;
                return acc;
            },
            {} as Record<StatusClass, number>
        );
    }, []);

    return {
        filter,
        setFilter,
        filtered,
        grouped,
        counts,
        total: HTTP_STATUS_CODES.length,
    };
}
