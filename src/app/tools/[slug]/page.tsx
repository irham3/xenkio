export const runtime = 'edge';

import { DUMMY_TOOLS } from '@/data/tools';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return DUMMY_TOOLS.map((tool) => ({
        slug: tool.slug || tool.id,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const tool = DUMMY_TOOLS.find(t => t.slug === slug || t.id === slug);

    if (!tool) return { title: 'Tool Not Found' };

    return {
        title: tool.title,
        description: tool.description,
        openGraph: {
            title: `${tool.title} | Xenkio`,
            description: tool.description,
        }
    };
}

export default async function ToolPage({ params }: Props) {
    const { slug } = await params;
    const tool = DUMMY_TOOLS.find(t => t.slug === slug || t.id === slug);

    if (!tool) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <tool.icon className="w-10 h-10" />
                </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{tool.title}</h1>
            <p className="text-xl text-gray-600 mb-10">{tool.description}</p>

            <div className="p-8 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p>This tool is currently under development. Please check back later!</p>
            </div>
        </div>
    );
}
