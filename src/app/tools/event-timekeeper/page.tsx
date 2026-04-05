import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { EventTimekeeperClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'event-timekeeper';

export const metadata: Metadata = {
    title: 'Event Timekeeper - Schedule & Countdown Manager for Events | Xenkio',
    description: 'Professional event schedule manager with real-time countdown, presenter focus mode, drag-and-drop reordering, and Excel/CSV import. Keep your events on track.',
    openGraph: {
        title: 'Event Timekeeper | Xenkio',
        description: 'Real-time event schedule manager with countdown timer, visual alerts, and presenter focus mode.',
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

export default function EventTimekeeperPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Event Timekeeper",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.description,
        "featureList": [
            "Event schedule management",
            "Real-time countdown timer",
            "Presenter focus mode",
            "Drag-and-drop reordering",
            "Excel and CSV import",
            "Visual time alerts",
            "Auto-advance sessions",
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <EventTimekeeperClient />
        </div>
    );
}
