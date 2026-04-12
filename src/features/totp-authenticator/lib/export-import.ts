import type { TotpAccount, TotpAlgorithm } from '../types';

function buildUri(account: TotpAccount): string {
    const label = account.issuer
        ? `${encodeURIComponent(account.issuer)}:${encodeURIComponent(account.name)}`
        : encodeURIComponent(account.name);
    const params = new URLSearchParams({
        secret: account.secret,
        issuer: account.issuer || account.name,
        algorithm: account.algorithm,
        digits: String(account.digits),
        period: String(account.period),
    });
    return `otpauth://totp/${label}?${params.toString()}`;
}

export function exportAccountsToText(accounts: TotpAccount[]): string {
    return accounts.map(buildUri).join('\n');
}

export function parseOtpauthUri(uri: string): Omit<TotpAccount, 'id'> | null {
    try {
        const url = new URL(uri);
        if (url.protocol !== 'otpauth:') return null;
        if (url.hostname !== 'totp') return null;

        const secret = url.searchParams.get('secret');
        if (!secret) return null;

        const rawLabel = decodeURIComponent(url.pathname.slice(1));
        const colonIdx = rawLabel.indexOf(':');
        let issuer = '';
        let name = rawLabel;
        if (colonIdx !== -1) {
            issuer = rawLabel.slice(0, colonIdx).trim();
            name = rawLabel.slice(colonIdx + 1).trim();
        }

        const issuerParam = url.searchParams.get('issuer');
        if (issuerParam) issuer = issuerParam;

        const algorithmParam = (url.searchParams.get('algorithm') ?? 'SHA1').toUpperCase() as TotpAlgorithm;
        const algorithm: TotpAlgorithm = ['SHA1', 'SHA256', 'SHA512'].includes(algorithmParam)
            ? algorithmParam
            : 'SHA1';

        const digitsParam = Number(url.searchParams.get('digits') ?? 6);
        const digits: 6 | 8 = digitsParam === 8 ? 8 : 6;

        const periodParam = Number(url.searchParams.get('period') ?? 30);
        const period = periodParam > 0 ? periodParam : 30;

        return { name, issuer, secret: secret.toUpperCase(), algorithm, digits, period };
    } catch {
        return null;
    }
}

export function importAccountsFromText(text: string): TotpAccount[] {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('otpauth://'))
        .map(line => {
            const parsed = parseOtpauthUri(line);
            if (!parsed) return null;
            return { id: crypto.randomUUID(), ...parsed } as TotpAccount;
        })
        .filter((a): a is TotpAccount => a !== null);
}
