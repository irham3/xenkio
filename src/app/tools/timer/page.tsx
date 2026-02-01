import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { TimerClient } from './client';
import { notFound } from 'next/navigation';

const slug = 'timer';

export const metadata: Metadata = {
    title: 'Event Timer & Countdown - Professional Time Management Tool',
    description: 'A professional countdown timer with customizable deadlines, presets, and visual progress tracking. Set specific end times or fixed durations easily.',
    openGraph: {
        title: 'Event Timer & Countdown | Xenkio',
        description: 'Professional time management tool with countdown and deadline tracking.',
    }
};

export default function TimerPage() {
    const tool = TOOLS.find(t => t.slug === slug);

    if (!tool) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Tool Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{tool.title}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
            </div>

            {/* Feature UI (Client Component) */}
            <TimerClient />
        </div>
    );
}

export const runtime = 'edge';
