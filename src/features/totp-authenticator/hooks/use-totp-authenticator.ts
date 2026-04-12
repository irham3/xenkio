'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TotpAccount, TotpAlgorithm } from '../types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateTotp, getRemainingSeconds, getProgress } from '../lib/totp';
import { exportAccountsToText, importAccountsFromText } from '../lib/export-import';
import { scanQrFromFile } from '../lib/qr-scanner';
import { toast } from 'sonner';

export interface TotpCodeEntry {
    id: string;
    code: string;
    remainingSeconds: number;
    progress: number;
}

export interface AddAccountForm {
    name: string;
    issuer: string;
    secret: string;
    algorithm: TotpAlgorithm;
    digits: 6 | 8;
    period: number;
}

const EMPTY_ACCOUNTS: TotpAccount[] = [];

export function useTotpAuthenticator() {
    const [accounts, setAccounts, clearStoredAccounts] = useLocalStorage<TotpAccount[]>('totp-authenticator-accounts', EMPTY_ACCOUNTS);
    const [codes, setCodes] = useState<Record<string, TotpCodeEntry>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refreshCodes = useCallback(() => {
        const now = Date.now();
        const newCodes: Record<string, TotpCodeEntry> = {};
        for (const account of accounts) {
            try {
                const code = generateTotp(account.secret, account.algorithm, account.digits, account.period, now);
                const remainingSeconds = getRemainingSeconds(account.period, now);
                const progress = getProgress(account.period, now);
                newCodes[account.id] = { id: account.id, code, remainingSeconds, progress };
            } catch {
                newCodes[account.id] = { id: account.id, code: '------', remainingSeconds: 0, progress: 0 };
            }
        }
        setCodes(newCodes);
    }, [accounts]);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(refreshCodes, 1000);
        // Defer the initial refresh to avoid calling setState synchronously in effect
        const id = setTimeout(refreshCodes, 0);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            clearTimeout(id);
        };
    }, [refreshCodes]);

    const addAccount = useCallback((form: AddAccountForm) => {
        const newAccount: TotpAccount = {
            id: crypto.randomUUID(),
            name: form.name.trim(),
            issuer: form.issuer.trim(),
            secret: form.secret.trim().toUpperCase().replace(/\s/g, ''),
            algorithm: form.algorithm,
            digits: form.digits,
            period: form.period,
        };
        setAccounts(prev => [...prev, newAccount]);
        setShowAddModal(false);
        toast.success('Account added');
    }, [setAccounts]);

    const removeAccount = useCallback((id: string) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
        toast.success('Account removed');
    }, [setAccounts]);

    const handleClearAll = useCallback(() => {
        clearStoredAccounts();
        setShowClearConfirm(false);
        toast.success('All accounts cleared');
    }, [clearStoredAccounts]);

    const handleExport = useCallback(() => {
        if (accounts.length === 0) {
            toast.error('No accounts to export');
            return;
        }
        const text = exportAccountsToText(accounts);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'totp-accounts.txt';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Accounts exported');
    }, [accounts]);

    const handleImport = useCallback((text: string) => {
        const imported = importAccountsFromText(text);
        if (imported.length === 0) {
            toast.error('No valid accounts found in file');
            return;
        }
        setAccounts(prev => {
            const existingSecrets = new Set(prev.map(a => a.secret));
            const newOnes = imported.filter(a => !existingSecrets.has(a.secret));
            if (newOnes.length === 0) {
                toast.info('All accounts already exist');
                return prev;
            }
            toast.success(`Imported ${newOnes.length} account${newOnes.length > 1 ? 's' : ''}`);
            return [...prev, ...newOnes];
        });
    }, [setAccounts]);

    const handleQrScan = useCallback(async (file: File) => {
        try {
            const parsed = await scanQrFromFile(file);
            return parsed;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to scan QR code';
            toast.error(msg);
            return null;
        }
    }, []);

    const copyCode = useCallback((code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success('Code copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy code');
        });
    }, []);

    return {
        accounts,
        codes,
        showAddModal,
        showClearConfirm,
        setShowAddModal,
        setShowClearConfirm,
        addAccount,
        removeAccount,
        handleClearAll,
        handleExport,
        handleImport,
        handleQrScan,
        copyCode,
    };
}

