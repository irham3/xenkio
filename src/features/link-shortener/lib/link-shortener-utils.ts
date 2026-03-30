import type { ShortenerProvider } from '../types';

export const PROVIDERS: Record<ShortenerProvider, { label: string; baseUrl: string; supportsAlias: boolean }> = {
    vgd: {
        label: 'v.gd',
        baseUrl: 'https://v.gd/create.php',
        supportsAlias: true,
    },
};

export function isValidUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function isValidAlias(alias: string): boolean {
    if (!alias) return true;
    return /^[a-zA-Z0-9_-]{4,30}$/.test(alias);
}

export function generateId(): string {
    return crypto.randomUUID();
}

interface ShortenerResponse {
    shorturl?: string;
    errorcode?: number;
    errormessage?: string;
}

export async function shortenUrl(
    originalUrl: string,
    provider: ShortenerProvider,
    alias?: string
): Promise<string> {
    const config = PROVIDERS[provider];
    const params = new URLSearchParams({
        format: 'json',
        url: originalUrl,
    });

    if (alias) {
        params.set('shorturl', alias);
    }

    const response = await fetch(`${config.baseUrl}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const data: ShortenerResponse = await response.json();

    if (data.errormessage) {
        throw new Error(data.errormessage);
    }

    if (!data.shorturl) {
        throw new Error('Failed to shorten URL. Please try again.');
    }

    return data.shorturl;
}
