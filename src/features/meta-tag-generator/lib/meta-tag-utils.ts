import { MetaTagConfig, MetaTagPreset } from '../types';

export function getDefaultConfig(): MetaTagConfig {
    return {
        title: '',
        description: '',
        keywords: '',
        author: '',
        robots: 'index, follow',
        canonical: '',
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1.0',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        ogUrl: '',
        ogType: 'website',
        ogSiteName: '',
        twitterCard: 'summary_large_image',
        twitterSite: '',
        twitterCreator: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        themeColor: '',
        language: 'en',
    };
}

export function configToMetaTags(config: MetaTagConfig): string {
    const lines: string[] = [];

    if (config.charset) {
        lines.push(`<meta charset="${config.charset}" />`);
    }

    if (config.viewport) {
        lines.push(`<meta name="viewport" content="${config.viewport}" />`);
    }

    if (config.title) {
        lines.push(`<title>${config.title}</title>`);
    }

    if (config.description) {
        lines.push(`<meta name="description" content="${config.description}" />`);
    }

    if (config.keywords) {
        lines.push(`<meta name="keywords" content="${config.keywords}" />`);
    }

    if (config.author) {
        lines.push(`<meta name="author" content="${config.author}" />`);
    }

    if (config.robots) {
        lines.push(`<meta name="robots" content="${config.robots}" />`);
    }

    if (config.canonical) {
        lines.push(`<link rel="canonical" href="${config.canonical}" />`);
    }

    if (config.language) {
        lines.push(`<meta http-equiv="content-language" content="${config.language}" />`);
    }

    if (config.themeColor) {
        lines.push(`<meta name="theme-color" content="${config.themeColor}" />`);
    }

    // Open Graph
    const hasOg = config.ogTitle || config.ogDescription || config.ogImage || config.ogUrl || config.ogType || config.ogSiteName;
    if (hasOg) {
        lines.push('');
        lines.push('<!-- Open Graph / Facebook -->');
    }
    if (config.ogType) {
        lines.push(`<meta property="og:type" content="${config.ogType}" />`);
    }
    if (config.ogTitle || config.title) {
        lines.push(`<meta property="og:title" content="${config.ogTitle || config.title}" />`);
    }
    if (config.ogDescription || config.description) {
        lines.push(`<meta property="og:description" content="${config.ogDescription || config.description}" />`);
    }
    if (config.ogImage) {
        lines.push(`<meta property="og:image" content="${config.ogImage}" />`);
    }
    if (config.ogUrl || config.canonical) {
        lines.push(`<meta property="og:url" content="${config.ogUrl || config.canonical}" />`);
    }
    if (config.ogSiteName) {
        lines.push(`<meta property="og:site_name" content="${config.ogSiteName}" />`);
    }

    // Twitter Card
    const hasTwitter = config.twitterCard || config.twitterSite || config.twitterCreator || config.twitterTitle || config.twitterDescription || config.twitterImage;
    if (hasTwitter) {
        lines.push('');
        lines.push('<!-- Twitter Card -->');
    }
    if (config.twitterCard) {
        lines.push(`<meta name="twitter:card" content="${config.twitterCard}" />`);
    }
    if (config.twitterSite) {
        lines.push(`<meta name="twitter:site" content="${config.twitterSite}" />`);
    }
    if (config.twitterCreator) {
        lines.push(`<meta name="twitter:creator" content="${config.twitterCreator}" />`);
    }
    if (config.twitterTitle || config.ogTitle || config.title) {
        lines.push(`<meta name="twitter:title" content="${config.twitterTitle || config.ogTitle || config.title}" />`);
    }
    if (config.twitterDescription || config.ogDescription || config.description) {
        lines.push(`<meta name="twitter:description" content="${config.twitterDescription || config.ogDescription || config.description}" />`);
    }
    if (config.twitterImage || config.ogImage) {
        lines.push(`<meta name="twitter:image" content="${config.twitterImage || config.ogImage}" />`);
    }

    return lines.join('\n');
}

export function getTitleCharCount(title: string): { count: number; status: 'good' | 'warning' | 'danger' } {
    const count = title.length;
    if (count === 0) return { count, status: 'good' };
    if (count >= 30 && count <= 60) return { count, status: 'good' };
    if (count > 60 && count <= 70) return { count, status: 'warning' };
    return { count, status: 'danger' };
}

export function getDescriptionCharCount(description: string): { count: number; status: 'good' | 'warning' | 'danger' } {
    const count = description.length;
    if (count === 0) return { count, status: 'good' };
    if (count >= 120 && count <= 160) return { count, status: 'good' };
    if ((count > 100 && count < 120) || (count > 160 && count <= 180)) return { count, status: 'warning' };
    return { count, status: 'danger' };
}

export const ROBOTS_OPTIONS = [
    'index, follow',
    'noindex, follow',
    'index, nofollow',
    'noindex, nofollow',
    'noarchive',
    'nosnippet',
    'noimageindex',
    'none',
] as const;

export const OG_TYPES = [
    'website',
    'article',
    'blog',
    'product',
    'profile',
    'book',
    'music.song',
    'music.album',
    'video.movie',
    'video.episode',
] as const;

export const TWITTER_CARD_TYPES = [
    'summary',
    'summary_large_image',
    'app',
    'player',
] as const;

export const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ru', label: 'Russian' },
    { value: 'nl', label: 'Dutch' },
    { value: 'sv', label: 'Swedish' },
    { value: 'pl', label: 'Polish' },
    { value: 'tr', label: 'Turkish' },
    { value: 'th', label: 'Thai' },
    { value: 'vi', label: 'Vietnamese' },
] as const;

export const PRESETS: MetaTagPreset[] = [
    {
        label: 'Blog Post',
        description: 'Optimized for blog articles and content',
        config: {
            robots: 'index, follow',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            language: 'en',
        },
    },
    {
        label: 'Landing Page',
        description: 'Perfect for marketing and landing pages',
        config: {
            robots: 'index, follow',
            ogType: 'website',
            twitterCard: 'summary_large_image',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            language: 'en',
        },
    },
    {
        label: 'E-Commerce',
        description: 'Optimized for product pages',
        config: {
            robots: 'index, follow',
            ogType: 'product',
            twitterCard: 'summary_large_image',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            language: 'en',
        },
    },
    {
        label: 'Portfolio',
        description: 'Showcase your personal or professional work',
        config: {
            robots: 'index, follow',
            ogType: 'profile',
            twitterCard: 'summary',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            language: 'en',
        },
    },
    {
        label: 'Private Page',
        description: 'Hidden from search engines',
        config: {
            robots: 'noindex, nofollow',
            ogType: 'website',
            twitterCard: 'summary',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0',
            language: 'en',
        },
    },
    {
        label: 'SPA / Web App',
        description: 'For single-page applications',
        config: {
            robots: 'index, follow',
            ogType: 'website',
            twitterCard: 'summary_large_image',
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
            language: 'en',
        },
    },
];
