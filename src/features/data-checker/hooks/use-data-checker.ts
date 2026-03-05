'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { DataRow, DataCheckerState, DataCheckerStats, RowStatus } from '../types';

function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

const EMPTY_STATE: DataCheckerState = {
    rows: [],
    rawInput: '',
    currentIndex: 0,
};

export function useDataChecker() {
    const [savedState, setSavedState, removeSavedState] = useLocalStorage<DataCheckerState>(
        'xenkio-data-checker-state',
        EMPTY_STATE
    );

    // Initial state is just a skeleton, the real data comes from localStorage after mount
    const [state, setState] = useState<DataCheckerState>(EMPTY_STATE);
    const [isMounted, setIsMounted] = useState(false);

    // Initial mount sync: once client loads, pull from localStorage
    useEffect(() => {
        setIsMounted(true);
        if (savedState !== EMPTY_STATE) {
            setState(savedState);
        }
    }, []); // Only on mount

    // Sync local state → localStorage (only after mount and when state changes)
    useEffect(() => {
        if (!isMounted) return;
        setSavedState(state);
    }, [state, setSavedState, isMounted]);

    // Warn before unload if there's checked progress
    useEffect(() => {
        const hasProgress = state.rows.length > 0 && state.rows.some((r) => r.status !== 'unchecked');
        if (!hasProgress) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.rows]);

    const stats: DataCheckerStats = useMemo(() => {
        const total = state.rows.length;
        const valid = state.rows.filter((r) => r.status === 'valid').length;
        const invalid = state.rows.filter((r) => r.status === 'invalid').length;
        const unchecked = state.rows.filter((r) => r.status === 'unchecked').length;
        const checked = valid + invalid;
        const progress = total > 0 ? Math.round((checked / total) * 100) : 0;
        return { total, checked, valid, invalid, unchecked, progress };
    }, [state.rows]);

    const currentRow = useMemo(() => {
        return state.rows[state.currentIndex] ?? null;
    }, [state.rows, state.currentIndex]);

    const loadData = useCallback((rawInput: string) => {
        const lines = rawInput.split('\n').filter((line) => line.trim().length > 0);
        const rows: DataRow[] = lines.map((line, idx) => ({
            id: generateId(),
            index: idx,
            value: line.trim(),
            status: 'unchecked' as RowStatus,
            comment: '',
        }));

        setState({ rows, rawInput, currentIndex: 0 });
    }, []);

    const markCurrentValid = useCallback(() => {
        setState((prev) => {
            const newRows = prev.rows.map((row, idx) =>
                idx === prev.currentIndex ? { ...row, status: 'valid' as RowStatus } : row
            );
            const nextUnchecked = newRows.findIndex((r, idx) => idx > prev.currentIndex && r.status === 'unchecked');
            const nextIndex = nextUnchecked !== -1 ? nextUnchecked : Math.min(prev.currentIndex + 1, prev.rows.length - 1);
            return { ...prev, rows: newRows, currentIndex: nextIndex };
        });
    }, []);

    const markCurrentInvalid = useCallback((comment: string) => {
        setState((prev) => {
            const newRows = prev.rows.map((row, idx) =>
                idx === prev.currentIndex ? { ...row, status: 'invalid' as RowStatus, comment } : row
            );
            const nextUnchecked = newRows.findIndex((r, idx) => idx > prev.currentIndex && r.status === 'unchecked');
            const nextIndex = nextUnchecked !== -1 ? nextUnchecked : Math.min(prev.currentIndex + 1, prev.rows.length - 1);
            return { ...prev, rows: newRows, currentIndex: nextIndex };
        });
    }, []);

    const setRowStatus = useCallback((rowId: string, status: RowStatus, comment?: string) => {
        setState((prev) => ({
            ...prev,
            rows: prev.rows.map((row) =>
                row.id === rowId ? { ...row, status, comment: comment ?? row.comment } : row
            ),
        }));
    }, []);

    const goToIndex = useCallback((index: number) => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.max(0, Math.min(index, prev.rows.length - 1)),
        }));
    }, []);

    const goToNext = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.min(prev.currentIndex + 1, prev.rows.length - 1),
        }));
    }, []);

    const goToPrev = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.max(prev.currentIndex - 1, 0),
        }));
    }, []);

    const goToNextUnchecked = useCallback(() => {
        setState((prev) => {
            const nextUnchecked = prev.rows.findIndex((r, idx) => idx > prev.currentIndex && r.status === 'unchecked');
            if (nextUnchecked !== -1) {
                return { ...prev, currentIndex: nextUnchecked };
            }
            const firstUnchecked = prev.rows.findIndex((r) => r.status === 'unchecked');
            if (firstUnchecked !== -1) {
                return { ...prev, currentIndex: firstUnchecked };
            }
            return prev;
        });
    }, []);

    const resetAll = useCallback(() => {
        setState((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => ({ ...row, status: 'unchecked', comment: '' })),
            currentIndex: 0,
        }));
    }, []);

    const clearAll = useCallback(() => {
        setState(EMPTY_STATE);
        removeSavedState();
    }, [removeSavedState]);

    const exportAsCSV = useCallback((): string => {
        const headerLine = 'Data,Status,Comment';
        const dataLines = state.rows.map((row) => {
            const value = row.value.includes(',') || row.value.includes('"')
                ? `"${row.value.replace(/"/g, '""')}"`
                : row.value;
            const comment = row.comment.includes(',') || row.comment.includes('"')
                ? `"${row.comment.replace(/"/g, '""')}"`
                : row.comment;
            return `${value},${row.status},${comment}`;
        });
        return [headerLine, ...dataLines].join('\n');
    }, [state.rows]);

    return {
        state,
        stats,
        currentRow,
        loadData,
        markCurrentValid,
        markCurrentInvalid,
        setRowStatus,
        goToIndex,
        goToNext,
        goToPrev,
        goToNextUnchecked,
        resetAll,
        clearAll,
        exportAsCSV,
    };
}
