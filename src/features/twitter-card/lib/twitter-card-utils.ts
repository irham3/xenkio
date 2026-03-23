import { TwitterCardConfig, TwitterCardPreset } from '../types';

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function getDefaultConfig(): TwitterCardConfig {
    return {
        cardType: 'summary_large_image',
        title: '',
        description: '',
        siteUsername: '',
        creatorUsername: '',
        image: '',
        imageAlt: '',
        playerUrl: '',
        playerWidth: '',
        playerHeight: '',
        appNameIphone: '',
        appIdIphone: '',
        appNameIpad: '',
        appIdIpad: '',
        appNameGooglePlay: '',
        appIdGooglePlay: '',
    };
}

export function configToMetaTags(config: TwitterCardConfig): string {
    const lines: string[] = [];

    if (config.cardType) {
        lines.push('<!-- Twitter Card Meta Tags -->');
        lines.push(`<meta name="twitter:card" content="${escapeHtml(config.cardType)}" />`);
    }

    if (config.title) {
        lines.push(`<meta name="twitter:title" content="${escapeHtml(config.title)}" />`);
    }
    if (config.description) {
        lines.push(`<meta name="twitter:description" content="${escapeHtml(config.description)}" />`);
    }
    if (config.siteUsername) {
        lines.push(`<meta name="twitter:site" content="${escapeHtml(config.siteUsername)}" />`);
    }
    if (config.creatorUsername) {
        lines.push(`<meta name="twitter:creator" content="${escapeHtml(config.creatorUsername)}" />`);
    }

    if (config.cardType === 'summary' || config.cardType === 'summary_large_image') {
        if (config.image) {
            lines.push(`<meta name="twitter:image" content="${escapeHtml(config.image)}" />`);
        }
        if (config.imageAlt) {
            lines.push(`<meta name="twitter:image:alt" content="${escapeHtml(config.imageAlt)}" />`);
        }
    }

    if (config.cardType === 'player') {
        if (config.image) {
            lines.push(`<meta name="twitter:image" content="${escapeHtml(config.image)}" />`);
        }
        if (config.playerUrl) {
            lines.push(`<meta name="twitter:player" content="${escapeHtml(config.playerUrl)}" />`);
        }
        if (config.playerWidth) {
            lines.push(`<meta name="twitter:player:width" content="${escapeHtml(config.playerWidth)}" />`);
        }
        if (config.playerHeight) {
            lines.push(`<meta name="twitter:player:height" content="${escapeHtml(config.playerHeight)}" />`);
        }
    }

    if (config.cardType === 'app') {
        if (config.appNameIphone) {
            lines.push(`<meta name="twitter:app:name:iphone" content="${escapeHtml(config.appNameIphone)}" />`);
        }
        if (config.appIdIphone) {
            lines.push(`<meta name="twitter:app:id:iphone" content="${escapeHtml(config.appIdIphone)}" />`);
        }
        if (config.appNameIpad) {
            lines.push(`<meta name="twitter:app:name:ipad" content="${escapeHtml(config.appNameIpad)}" />`);
        }
        if (config.appIdIpad) {
            lines.push(`<meta name="twitter:app:id:ipad" content="${escapeHtml(config.appIdIpad)}" />`);
        }
        if (config.appNameGooglePlay) {
            lines.push(`<meta name="twitter:app:name:googleplay" content="${escapeHtml(config.appNameGooglePlay)}" />`);
        }
        if (config.appIdGooglePlay) {
            lines.push(`<meta name="twitter:app:id:googleplay" content="${escapeHtml(config.appIdGooglePlay)}" />`);
        }
    }

    return lines.join('\n');
}

export const CARD_TYPES = [
    { value: 'summary', label: 'Summary', description: 'Small card with thumbnail' },
    { value: 'summary_large_image', label: 'Summary Large Image', description: 'Large image card' },
    { value: 'player', label: 'Player', description: 'Video/audio/media player' },
    { value: 'app', label: 'App', description: 'Mobile app deep link' },
] as const;

export const PRESETS: TwitterCardPreset[] = [
    {
        label: 'Blog Post',
        description: 'Large image card for articles and blog posts',
        config: {
            cardType: 'summary_large_image',
        },
    },
    {
        label: 'Website',
        description: 'Standard summary card with small thumbnail',
        config: {
            cardType: 'summary',
        },
    },
    {
        label: 'Video',
        description: 'Player card for embedded video content',
        config: {
            cardType: 'player',
            playerWidth: '480',
            playerHeight: '270',
        },
    },
];

export function getCharacterCount(value: string, max: number): { count: number; max: number; isOver: boolean } {
    return {
        count: value.length,
        max,
        isOver: value.length > max,
    };
}
