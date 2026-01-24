'use client';

import { useParams } from 'next/navigation';
import { DUMMY_TOOLS } from '@/data/dummy-tools';

export default function ToolPage() {
    const params = useParams();
    const slug = params.slug as string;
    const tool = DUMMY_TOOLS.find(t => t.slug === slug);

    if (!tool) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900">Tool Not Found</h1>
                <p className="mt-4 text-gray-600">The tool you are looking for does not exist.</p>
            </div>
        );
    }

    // Fallback for other tools (non-functional placeholder)
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
