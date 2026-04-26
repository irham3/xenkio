import type { TotpAccount } from '../types';

const STORAGE_KEY = 'totp-authenticator-accounts';

export function loadAccounts(): TotpAccount[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as TotpAccount[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveAccounts(accounts: TotpAccount[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function clearAccounts(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
