import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import P2PShareClient from './client';

const slug = 'p2p-share';

export const metadata: Metadata = {
    title: 'P2P Local Data Transfer - Xenkio',
    description:
        'Send text and files directly between devices using peer-to-peer WebRTC. No server uploads, no accounts — data travels straight from browser to browser.',
    keywords: [
        'p2p file transfer',
        'peer to peer share',
        'webrtc file sharing',
        'local data transfer',
        'browser file sharing',
        'no upload file share',
        'direct transfer',
        'peerjs tool',
    ],
    openGraph: {
        title: 'P2P Local Data Transfer | Xenkio',
        description:
            'Send files and text directly between browsers with WebRTC. No uploads, completely private.',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Xenkio | Free Browser-Based Tools',
                type: 'image/jpeg',
            },
        ],
    },
};

export default function P2PSharePage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'P2P Local Data Transfer',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Peer-to-peer file transfer via WebRTC',
            'Send text messages between devices',
            'No file size limits',
            'No server uploads — completely private',
            'Works in any modern browser',
            'Simple Peer ID sharing flow',
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    P2P Local Data Transfer
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Send text and files directly between devices via WebRTC — no
                    uploads, no accounts, nothing stored on any server.
                </p>
            </div>

            <P2PShareClient />
        </div>
    );
}
