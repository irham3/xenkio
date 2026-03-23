import { OpenGraphConfig, OpenGraphPreset } from '../types';

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function getDefaultConfig(): OpenGraphConfig {
    return {
        title: '',
        description: '',
        url: '',
        image: '',
        imageAlt: '',
        type: 'website',
        siteName: '',
        locale: 'en_US',
        twitterCard: 'summary_large_image',
        twitterSite: '',
        twitterCreator: '',
    };
}

export function configToMetaTags(config: OpenGraphConfig): string {
    const lines: string[] = [];

    if (config.type || config.title || config.description || config.url || config.image || config.siteName || config.locale) {
        lines.push('<!-- Open Graph -->');
    }

    if (config.type) {
        lines.push(`<meta property="og:type" content="${escapeHtml(config.type)}" />`);
    }
    if (config.title) {
        lines.push(`<meta property="og:title" content="${escapeHtml(config.title)}" />`);
    }
    if (config.description) {
        lines.push(`<meta property="og:description" content="${escapeHtml(config.description)}" />`);
    }
    if (config.url) {
        lines.push(`<meta property="og:url" content="${escapeHtml(config.url)}" />`);
    }
    if (config.image) {
        lines.push(`<meta property="og:image" content="${escapeHtml(config.image)}" />`);
    }
    if (config.imageAlt) {
        lines.push(`<meta property="og:image:alt" content="${escapeHtml(config.imageAlt)}" />`);
    }
    if (config.siteName) {
        lines.push(`<meta property="og:site_name" content="${escapeHtml(config.siteName)}" />`);
    }
    if (config.locale) {
        lines.push(`<meta property="og:locale" content="${escapeHtml(config.locale)}" />`);
    }

    if (config.twitterCard || config.twitterSite || config.twitterCreator || config.title || config.description || config.image) {
        lines.push('');
        lines.push('<!-- Twitter Card -->');
    }

    if (config.twitterCard) {
        lines.push(`<meta name="twitter:card" content="${escapeHtml(config.twitterCard)}" />`);
    }
    if (config.twitterSite) {
        lines.push(`<meta name="twitter:site" content="${escapeHtml(config.twitterSite)}" />`);
    }
    if (config.twitterCreator) {
        lines.push(`<meta name="twitter:creator" content="${escapeHtml(config.twitterCreator)}" />`);
    }
    if (config.title) {
        lines.push(`<meta name="twitter:title" content="${escapeHtml(config.title)}" />`);
    }
    if (config.description) {
        lines.push(`<meta name="twitter:description" content="${escapeHtml(config.description)}" />`);
    }
    if (config.image) {
        lines.push(`<meta name="twitter:image" content="${escapeHtml(config.image)}" />`);
    }

    return lines.join('\n');
}

export const OG_TYPES = ['website', 'article', 'blog', 'product', 'profile'] as const;

export const TWITTER_CARD_TYPES = ['summary', 'summary_large_image', 'app', 'player'] as const;

export const PRESETS: OpenGraphPreset[] = [
    {
        label: 'Website',
        description: 'For homepage and landing pages',
        config: {
            type: 'website',
            twitterCard: 'summary_large_image',
            locale: 'en_US',
        },
    },
    {
        label: 'Article',
        description: 'For blog posts and news pages',
        config: {
            type: 'article',
            twitterCard: 'summary_large_image',
            locale: 'en_US',
        },
    },
    {
        label: 'Product',
        description: 'For e-commerce and product pages',
        config: {
            type: 'product',
            twitterCard: 'summary_large_image',
            locale: 'en_US',
        },
    },
];
