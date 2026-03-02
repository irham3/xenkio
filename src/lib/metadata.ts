import { Metadata } from 'next';

const SITE_URL = 'https://xenkio.com';
const SITE_NAME = 'Xenkio';
const DEFAULT_OG_IMAGE = '/og-image.jpg';

interface PageMetadataOptions {
    title: string;
    description: string;
    path?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

/**
 * Creates consistent metadata for all pages, ensuring proper OG tags
 * for Telegram, WhatsApp, Twitter/X, Facebook, and other social platforms.
 */
export function createMetadata({
    title,
    description,
    path = '',
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
}: PageMetadataOptions): Metadata {
    const url = `${SITE_URL}${path}`;
    const imageUrl = ogImage || DEFAULT_OG_IMAGE;
    const resolvedOgTitle = ogTitle || title;
    const resolvedOgDescription = ogDescription || description;

    return {
        title,
        description,
        ...(keywords && { keywords }),
        openGraph: {
            title: resolvedOgTitle,
            description: resolvedOgDescription,
            url,
            siteName: SITE_NAME,
            type: 'website',
            locale: 'en_US',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: resolvedOgTitle,
                    type: 'image/jpeg',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: resolvedOgTitle,
            description: resolvedOgDescription,
            images: [imageUrl],
        },
        alternates: {
            canonical: url,
        },
    };
}
