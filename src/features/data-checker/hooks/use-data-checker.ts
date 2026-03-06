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
    history: [],
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
        if (savedState && savedState !== EMPTY_STATE) {
            // Merge with EMPTY_STATE to ensure new fields like 'history' exist even for old saved data
            setState({ ...EMPTY_STATE, ...savedState, history: savedState.history ?? [] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount — intentionally ignoring savedState to avoid infinite loop

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

    const addToHistory = useCallback((row: DataRow) => {
        setState(prev => ({
            ...prev,
            history: [...prev.history, { ...row }].slice(-20) // Keep last 20 actions
        }));
    }, []);

    const undo = useCallback(() => {
        setState(prev => {
            if (prev.history.length === 0) return prev;

            const lastAction = prev.history[prev.history.length - 1];
            const newHistory = prev.history.slice(0, -1);

            const newRows = prev.rows.map(row =>
                row.id === lastAction.id ? { ...row, ...lastAction } : row
            );

            // Optionally move to the undone item's index
            const undoneIndex = lastAction.index ?? prev.currentIndex;

            return {
                ...prev,
                rows: newRows,
                currentIndex: undoneIndex,
                history: newHistory
            };
        });
    }, []);

    const loadData = useCallback((rawInput: string) => {
        const lines = rawInput.split('\n').filter((line) => line.trim().length > 0);
        const rows: DataRow[] = lines.map((line, idx) => ({
            id: generateId(),
            index: idx,
            value: line.trim(),
            status: 'unchecked' as RowStatus,
            comment: '',
        }));

        setState({ rows, rawInput, currentIndex: 0, history: [] });
    }, []);

    const markCurrentValid = useCallback(() => {
        const rowToSave = state.rows[state.currentIndex];
        if (rowToSave) addToHistory(rowToSave);

        setState((prev) => {
            const newRows = prev.rows.map((row, idx) =>
                idx === prev.currentIndex ? { ...row, status: 'valid' as RowStatus } : row
            );
            const nextUnchecked = newRows.findIndex((r, idx) => idx > prev.currentIndex && r.status === 'unchecked');
            const nextIndex = nextUnchecked !== -1 ? nextUnchecked : Math.min(prev.currentIndex + 1, prev.rows.length - 1);
            return { ...prev, rows: newRows, currentIndex: nextIndex };
        });
    }, [state.rows, state.currentIndex, addToHistory]);

    const markCurrentInvalid = useCallback((comment: string) => {
        const rowToSave = state.rows[state.currentIndex];
        if (rowToSave) addToHistory(rowToSave);

        setState((prev) => {
            const newRows = prev.rows.map((row, idx) =>
                idx === prev.currentIndex ? { ...row, status: 'invalid' as RowStatus, comment } : row
            );
            const nextUnchecked = newRows.findIndex((r, idx) => idx > prev.currentIndex && r.status === 'unchecked');
            const nextIndex = nextUnchecked !== -1 ? nextUnchecked : Math.min(prev.currentIndex + 1, prev.rows.length - 1);
            return { ...prev, rows: newRows, currentIndex: nextIndex };
        });
    }, [state.rows, state.currentIndex, addToHistory]);

    const setRowStatus = useCallback((rowId: string, status: RowStatus, comment?: string) => {
        const rowToSave = state.rows.find(r => r.id === rowId);
        if (rowToSave) addToHistory(rowToSave);

        setState((prev) => ({
            ...prev,
            rows: prev.rows.map((row) =>
                row.id === rowId ? { ...row, status, comment: comment ?? row.comment } : row
            ),
        }));
    }, [state.rows, addToHistory]);

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

    const updateRowValue = useCallback((index: number, newValue: string) => {
        const rowToSave = state.rows[index];
        if (rowToSave) addToHistory(rowToSave);

        setState((prev) => ({
            ...prev,
            rows: prev.rows.map((row, idx) =>
                idx === index ? { ...row, value: newValue } : row
            ),
        }));
    }, [state.rows, addToHistory]);

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

    const nextUncheckedIndex = state.rows.findIndex((r, idx) => idx > state.currentIndex && r.status === 'unchecked');
    const nextRow = nextUncheckedIndex !== -1 ? state.rows[nextUncheckedIndex] : null;

    return {
        state,
        stats,
        currentRow,
        nextRow,
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
        updateRowValue,
        undo,
        exportAsCSV,
    };
}
