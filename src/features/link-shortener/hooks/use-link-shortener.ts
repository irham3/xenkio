'use client';

import { useCallback, useEffect, useReducer } from 'react';
import type { LinkShortenerState, ShortenerProvider, ShortenedLink } from '../types';
import { shortenUrl, isValidUrl, isValidAlias, generateId } from '../lib/link-shortener-utils';

const HISTORY_KEY = 'link-shortener-history';
const MAX_HISTORY = 20;

type Action =
    | { type: 'SET_URL'; payload: string }
    | { type: 'SET_ALIAS'; payload: string }
    | { type: 'SET_PROVIDER'; payload: ShortenerProvider }
    | { type: 'SHORTEN_START' }
    | { type: 'SHORTEN_SUCCESS'; payload: { shortUrl: string; entry: ShortenedLink } }
    | { type: 'SHORTEN_ERROR'; payload: string }
    | { type: 'RESET_FORM' }
    | { type: 'DELETE_HISTORY'; payload: string }
    | { type: 'CLEAR_HISTORY' }
    | { type: 'LOAD_HISTORY'; payload: ShortenedLink[] };

function reducer(state: LinkShortenerState, action: Action): LinkShortenerState {
    switch (action.type) {
        case 'SET_URL':
            return { ...state, url: action.payload, error: null, result: null };
        case 'SET_ALIAS':
            return { ...state, alias: action.payload, error: null };
        case 'SET_PROVIDER':
            return { ...state, provider: action.payload };
        case 'SHORTEN_START':
            return { ...state, status: 'loading', error: null, result: null };
        case 'SHORTEN_SUCCESS': {
            const newHistory = [action.payload.entry, ...state.history].slice(0, MAX_HISTORY);
            return {
                ...state,
                status: 'success',
                result: action.payload.shortUrl,
                history: newHistory,
                alias: '',
            };
        }
        case 'SHORTEN_ERROR':
            return { ...state, status: 'error', error: action.payload };
        case 'RESET_FORM':
            return { ...state, url: '', alias: '', status: 'idle', error: null, result: null };
        case 'DELETE_HISTORY': {
            const updated = state.history.filter((item) => item.id !== action.payload);
            return { ...state, history: updated };
        }
        case 'CLEAR_HISTORY':
            return { ...state, history: [] };
        case 'LOAD_HISTORY':
            return { ...state, history: action.payload };
        default:
            return state;
    }
}

const initialState: LinkShortenerState = {
    url: '',
    alias: '',
    provider: 'isgd',
    status: 'idle',
    error: null,
    result: null,
    history: [],
};

export function useLinkShortener() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            if (stored) {
                const parsed: ShortenedLink[] = JSON.parse(stored);
                dispatch({ type: 'LOAD_HISTORY', payload: parsed });
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
        } catch {
            // ignore storage errors
        }
    }, [state.history]);

    const setUrl = useCallback((url: string) => {
        dispatch({ type: 'SET_URL', payload: url });
    }, []);

    const setAlias = useCallback((alias: string) => {
        dispatch({ type: 'SET_ALIAS', payload: alias });
    }, []);

    const setProvider = useCallback((provider: ShortenerProvider) => {
        dispatch({ type: 'SET_PROVIDER', payload: provider });
    }, []);

    const shorten = useCallback(async () => {
        const trimmedUrl = state.url.trim();
        const trimmedAlias = state.alias.trim();

        if (!trimmedUrl) {
            dispatch({ type: 'SHORTEN_ERROR', payload: 'Please enter a URL to shorten.' });
            return;
        }

        if (!isValidUrl(trimmedUrl)) {
            dispatch({ type: 'SHORTEN_ERROR', payload: 'Please enter a valid URL (starting with http:// or https://).' });
            return;
        }

        if (trimmedAlias && !isValidAlias(trimmedAlias)) {
            dispatch({ type: 'SHORTEN_ERROR', payload: 'Custom alias must be 4–30 characters and contain only letters, numbers, hyphens, or underscores.' });
            return;
        }

        dispatch({ type: 'SHORTEN_START' });

        try {
            const shortUrl = await shortenUrl(trimmedUrl, state.provider, trimmedAlias || undefined);
            const entry: ShortenedLink = {
                id: generateId(),
                originalUrl: trimmedUrl,
                shortUrl,
                alias: trimmedAlias || undefined,
                provider: state.provider,
                createdAt: Date.now(),
            };
            dispatch({ type: 'SHORTEN_SUCCESS', payload: { shortUrl, entry } });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
            dispatch({ type: 'SHORTEN_ERROR', payload: message });
        }
    }, [state.url, state.alias, state.provider]);

    const resetForm = useCallback(() => {
        dispatch({ type: 'RESET_FORM' });
    }, []);

    const deleteHistory = useCallback((id: string) => {
        dispatch({ type: 'DELETE_HISTORY', payload: id });
    }, []);

    const clearHistory = useCallback(() => {
        dispatch({ type: 'CLEAR_HISTORY' });
    }, []);

    return {
        state,
        setUrl,
        setAlias,
        setProvider,
        shorten,
        resetForm,
        deleteHistory,
        clearHistory,
    };
}
