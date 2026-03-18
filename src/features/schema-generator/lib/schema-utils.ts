import { SchemaGeneratorConfig, SchemaPreset, SchemaType } from '../types';

interface SchemaTypeOption {
    value: SchemaType;
    label: string;
    description: string;
}

export const SCHEMA_TYPES: SchemaTypeOption[] = [
    {
        value: 'organization',
        label: 'Organization',
        description: 'Company, startup, agency, or local business profile.',
    },
    {
        value: 'website',
        label: 'Website',
        description: 'Website with optional search action markup.',
    },
    {
        value: 'article',
        label: 'Article',
        description: 'Blog post, news article, or editorial content.',
    },
    {
        value: 'faq',
        label: 'FAQ',
        description: 'Frequently asked questions with answers.',
    },
];

export const PRESETS: SchemaPreset[] = [
    {
        label: 'Business Profile',
        description: 'Organization schema for your company homepage.',
        schemaType: 'organization',
    },
    {
        label: 'Blog Article',
        description: 'Article schema with author and publish date fields.',
        schemaType: 'article',
    },
    {
        label: 'Help Center FAQ',
        description: 'FAQ schema for support or product pages.',
        schemaType: 'faq',
    },
];

function generateFaqId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `faq-${crypto.randomUUID()}`;
    }

    return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createFaqItem(question = '', answer = '') {
    return {
        id: generateFaqId(),
        question,
        answer,
    };
}

export function getDefaultConfig(): SchemaGeneratorConfig {
    return {
        schemaType: 'organization',
        name: '',
        description: '',
        url: 'https://example.com',
        image: '',
        headline: '',
        authorName: '',
        publisherName: '',
        datePublished: '',
        dateModified: '',
        faqs: [createFaqItem()],
    };
}

export function configToSchema(config: SchemaGeneratorConfig): Record<string, unknown> {
    const baseSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
    };

    if (config.schemaType === 'organization') {
        const schema: Record<string, unknown> = {
            ...baseSchema,
            '@type': 'Organization',
            'name': config.name || 'Your Organization Name',
        };

        if (config.description.trim()) schema.description = config.description.trim();
        if (config.url.trim()) schema.url = config.url.trim();
        if (config.image.trim()) schema.logo = config.image.trim();

        return schema;
    }

    if (config.schemaType === 'website') {
        const schema: Record<string, unknown> = {
            ...baseSchema,
            '@type': 'WebSite',
            'name': config.name || 'Your Website Name',
            'url': config.url || 'https://example.com',
        };

        if (config.description.trim()) schema.description = config.description.trim();

        if (config.url.trim()) {
            schema.potentialAction = {
                '@type': 'SearchAction',
                target: `${config.url.trim().replace(/\/+$/, '')}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
            };
        }

        return schema;
    }

    if (config.schemaType === 'article') {
        const schema: Record<string, unknown> = {
            ...baseSchema,
            '@type': 'Article',
            'headline': config.headline || config.name || 'Article headline',
            'description': config.description || 'Article summary',
            'mainEntityOfPage': config.url || 'https://example.com/article',
        };

        if (config.image.trim()) schema.image = [config.image.trim()];
        if (config.authorName.trim()) schema.author = { '@type': 'Person', name: config.authorName.trim() };
        if (config.publisherName.trim()) {
            schema.publisher = {
                '@type': 'Organization',
                name: config.publisherName.trim(),
            };
        }
        if (config.datePublished.trim()) schema.datePublished = config.datePublished.trim();
        if (config.dateModified.trim()) schema.dateModified = config.dateModified.trim();

        return schema;
    }

    const mainEntity = config.faqs
        .map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim(),
        }))
        .filter((item) => item.question && item.answer)
        .map((item) => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer,
            },
        }));

    return {
        ...baseSchema,
        '@type': 'FAQPage',
        mainEntity,
    };
}

export function configToJsonLdString(config: SchemaGeneratorConfig): string {
    return JSON.stringify(configToSchema(config), null, 2);
}
