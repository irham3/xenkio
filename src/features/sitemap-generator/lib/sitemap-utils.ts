import {
    SitemapChangeFrequency,
    SitemapGeneratorConfig,
    SitemapPreset,
    SitemapUrlEntry,
} from '../types';

let counter = 0;

export const CHANGE_FREQUENCIES: SitemapChangeFrequency[] = [
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
];

export const PRESETS: SitemapPreset[] = [
    {
        label: 'Basic Site',
        description: 'Homepage, about, and contact pages',
        paths: ['/', '/about', '/contact'],
    },
    {
        label: 'Blog',
        description: 'Homepage, blog index, and categories',
        paths: ['/', '/blog', '/categories', '/about', '/contact'],
    },
    {
        label: 'E-Commerce',
        description: 'Store pages for products and policies',
        paths: ['/', '/shop', '/categories', '/cart', '/checkout', '/privacy-policy'],
    },
];

export function generateId(): string {
    counter += 1;
    return `sitemap-url-${Date.now()}-${counter}`;
}

export function createUrlEntry(path = '/'): SitemapUrlEntry {
    return {
        id: generateId(),
        path,
        lastmod: '',
        changefreq: 'weekly',
        priority: 0.8,
    };
}

export function getDefaultConfig(): SitemapGeneratorConfig {
    return {
        baseUrl: 'https://example.com',
        urls: [createUrlEntry('/')],
    };
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, '');
}

function normalizePath(path: string): string {
    const trimmed = path.trim();

    if (!trimmed) {
        return '';
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function toLocation(baseUrl: string, path: string): string {
    const normalizedPath = normalizePath(path);

    if (!normalizedPath) {
        return '';
    }

    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
        return normalizedPath;
    }

    const normalizedBase = normalizeBaseUrl(baseUrl);

    if (!normalizedBase) {
        return normalizedPath;
    }

    return `${normalizedBase}${normalizedPath}`;
}

export function clampPriority(priority: number): number {
    if (Number.isNaN(priority)) {
        return 0.5;
    }

    return Math.min(1, Math.max(0, priority));
}

export function configToSitemapXml(config: SitemapGeneratorConfig): string {
    const urlBlocks = config.urls
        .map((entry) => {
            const location = toLocation(config.baseUrl, entry.path);

            if (!location) {
                return '';
            }

            const lines = [
                '  <url>',
                `    <loc>${escapeXml(location)}</loc>`,
            ];

            if (entry.lastmod.trim()) {
                lines.push(`    <lastmod>${escapeXml(entry.lastmod.trim())}</lastmod>`);
            }

            lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
            lines.push(`    <priority>${clampPriority(entry.priority).toFixed(1)}</priority>`);
            lines.push('  </url>');

            return lines.join('\n');
        })
        .filter(Boolean)
        .join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urlBlocks,
        '</urlset>',
    ].join('\n');
}
