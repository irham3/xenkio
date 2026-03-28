export type ShortenStatus = 'idle' | 'loading' | 'success' | 'error';

export type ShortenerProvider = 'isgd' | 'vgd';

export interface ShortenedLink {
    id: string;
    originalUrl: string;
    shortUrl: string;
    alias?: string;
    provider: ShortenerProvider;
    createdAt: number;
}

export interface LinkShortenerState {
    url: string;
    alias: string;
    provider: ShortenerProvider;
    status: ShortenStatus;
    error: string | null;
    result: string | null;
    history: ShortenedLink[];
}
