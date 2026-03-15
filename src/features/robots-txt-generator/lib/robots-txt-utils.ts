import { RobotRule, RobotsTxtConfig, RobotPreset } from '../types';

let counter = 0;

export function generateId(): string {
    counter += 1;
    return `rule-${Date.now()}-${counter}`;
}

export function createDefaultRule(): RobotRule {
    return {
        id: generateId(),
        userAgent: '*',
        allow: ['/'],
        disallow: [],
    };
}

export function getDefaultConfig(): RobotsTxtConfig {
    return {
        rules: [createDefaultRule()],
        sitemaps: [],
    };
}

export function configToRobotsTxt(config: RobotsTxtConfig): string {
    const lines: string[] = [];

    for (const rule of config.rules) {
        lines.push(`User-agent: ${rule.userAgent}`);

        for (const path of rule.disallow) {
            if (path.trim()) {
                lines.push(`Disallow: ${path}`);
            }
        }

        for (const path of rule.allow) {
            if (path.trim()) {
                lines.push(`Allow: ${path}`);
            }
        }

        if (rule.crawlDelay !== undefined && rule.crawlDelay > 0) {
            lines.push(`Crawl-delay: ${rule.crawlDelay}`);
        }

        lines.push('');
    }

    for (const sitemap of config.sitemaps) {
        if (sitemap.trim()) {
            lines.push(`Sitemap: ${sitemap}`);
        }
    }

    if (config.host?.trim()) {
        lines.push(`Host: ${config.host}`);
    }

    return lines.join('\n').trim() + '\n';
}

export const COMMON_USER_AGENTS = [
    '*',
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Googlebot-Video',
    'Bingbot',
    'Slurp',
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'facebot',
    'ia_archiver',
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'Twitterbot',
    'Applebot',
    'rogerbot',
    'GPTBot',
    'ChatGPT-User',
    'CCBot',
    'anthropic-ai',
    'ClaudeBot',
    'Google-Extended',
    'PerplexityBot',
    'Bytespider',
] as const;

export const COMMON_PATHS = [
    '/',
    '/admin/',
    '/private/',
    '/api/',
    '/cgi-bin/',
    '/tmp/',
    '/wp-admin/',
    '/wp-login.php',
    '/wp-includes/',
    '/search',
    '/login',
    '/register',
    '/cart/',
    '/checkout/',
    '/account/',
    '/*.pdf$',
    '/*.doc$',
    '/*.json$',
    '/assets/',
    '/static/',
    '/images/',
] as const;

export const PRESETS: RobotPreset[] = [
    {
        label: 'Allow All',
        description: 'Allow all crawlers to access the entire site',
        config: {
            rules: [{
                id: 'preset-allow-all',
                userAgent: '*',
                allow: ['/'],
                disallow: [],
            }],
            sitemaps: [],
        },
    },
    {
        label: 'Block All',
        description: 'Disallow all crawlers from accessing any page',
        config: {
            rules: [{
                id: 'preset-block-all',
                userAgent: '*',
                allow: [],
                disallow: ['/'],
            }],
            sitemaps: [],
        },
    },
    {
        label: 'Block AI Bots',
        description: 'Block AI crawlers (GPTBot, CCBot, etc.) while allowing search engines',
        config: {
            rules: [
                {
                    id: 'preset-ai-allow',
                    userAgent: '*',
                    allow: ['/'],
                    disallow: [],
                },
                {
                    id: 'preset-ai-gptbot',
                    userAgent: 'GPTBot',
                    allow: [],
                    disallow: ['/'],
                },
                {
                    id: 'preset-ai-chatgpt',
                    userAgent: 'ChatGPT-User',
                    allow: [],
                    disallow: ['/'],
                },
                {
                    id: 'preset-ai-ccbot',
                    userAgent: 'CCBot',
                    allow: [],
                    disallow: ['/'],
                },
                {
                    id: 'preset-ai-anthropic',
                    userAgent: 'anthropic-ai',
                    allow: [],
                    disallow: ['/'],
                },
                {
                    id: 'preset-ai-claude',
                    userAgent: 'ClaudeBot',
                    allow: [],
                    disallow: ['/'],
                },
                {
                    id: 'preset-ai-google-ext',
                    userAgent: 'Google-Extended',
                    allow: [],
                    disallow: ['/'],
                },
            ],
            sitemaps: [],
        },
    },
    {
        label: 'WordPress Default',
        description: 'Standard robots.txt for WordPress sites',
        config: {
            rules: [{
                id: 'preset-wp',
                userAgent: '*',
                allow: ['/'],
                disallow: ['/wp-admin/', '/wp-includes/', '/wp-login.php', '/wp-json/', '/xmlrpc.php'],
            }],
            sitemaps: ['/sitemap.xml'],
        },
    },
    {
        label: 'E-Commerce',
        description: 'Optimized for online stores with protected areas',
        config: {
            rules: [{
                id: 'preset-ecommerce',
                userAgent: '*',
                allow: ['/'],
                disallow: ['/cart/', '/checkout/', '/account/', '/admin/', '/search', '/api/'],
            }],
            sitemaps: ['/sitemap.xml'],
        },
    },
    {
        label: 'Google Only',
        description: 'Only allow Googlebot to crawl your site',
        config: {
            rules: [
                {
                    id: 'preset-google-allow',
                    userAgent: 'Googlebot',
                    allow: ['/'],
                    disallow: [],
                },
                {
                    id: 'preset-google-block',
                    userAgent: '*',
                    allow: [],
                    disallow: ['/'],
                },
            ],
            sitemaps: ['/sitemap.xml'],
        },
    },
];
