import { UTMParams, UTMPreset } from '../types';

export const UTM_PRESETS: UTMPreset[] = [
    {
        label: 'Social Media',
        description: 'Traffic from social channels',
        params: {
            medium: 'social',
        },
    },
    {
        label: 'Email Newsletter',
        description: 'Weekly campaign emails',
        params: {
            source: 'newsletter',
            medium: 'email',
        },
    },
    {
        label: 'Paid Ads',
        description: 'Performance ad campaigns',
        params: {
            medium: 'cpc',
        },
    },
    {
        label: 'Influencer',
        description: 'Creator partnership tracking',
        params: {
            medium: 'influencer',
        },
    },
];

export function getDefaultParams(): UTMParams {
    return {
        source: '',
        medium: '',
        campaign: '',
        term: '',
        content: '',
    };
}

export function normalizeUrl(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        return '';
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return `https://${trimmed}`;
}

export function buildUtmUrl(baseUrl: string, params: UTMParams): string {
    const normalized = normalizeUrl(baseUrl);

    if (!normalized) {
        return '';
    }

    try {
        const url = new URL(normalized);

        if (params.source.trim()) {
            url.searchParams.set('utm_source', params.source.trim());
        }
        if (params.medium.trim()) {
            url.searchParams.set('utm_medium', params.medium.trim());
        }
        if (params.campaign.trim()) {
            url.searchParams.set('utm_campaign', params.campaign.trim());
        }
        if (params.term.trim()) {
            url.searchParams.set('utm_term', params.term.trim());
        }
        if (params.content.trim()) {
            url.searchParams.set('utm_content', params.content.trim());
        }

        return url.toString();
    } catch {
        return '';
    }
}

export function hasRequiredParams(params: UTMParams): boolean {
    return Boolean(params.source.trim() && params.medium.trim() && params.campaign.trim());
}

export function toQueryOnly(params: UTMParams): string {
    const searchParams = new URLSearchParams();

    if (params.source.trim()) searchParams.set('utm_source', params.source.trim());
    if (params.medium.trim()) searchParams.set('utm_medium', params.medium.trim());
    if (params.campaign.trim()) searchParams.set('utm_campaign', params.campaign.trim());
    if (params.term.trim()) searchParams.set('utm_term', params.term.trim());
    if (params.content.trim()) searchParams.set('utm_content', params.content.trim());

    return searchParams.toString();
}
