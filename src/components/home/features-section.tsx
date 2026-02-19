'use client';

import { ShieldCheck, Infinity, Layers, Wifi } from 'lucide-react';

const features = [
    {
        name: 'Private by design',
        description: 'Nothing leaves your browser. Period.',
        icon: ShieldCheck,
    },
    {
        name: 'No limits',
        description: 'No file size caps, no daily quotas, no paywalls.',
        icon: Infinity,
    },
    {
        name: 'Batch everything',
        description: 'Drop 100 files at once. We handle the rest.',
        icon: Layers,
    },
    {
        name: 'Works offline',
        description: 'Load once, use anywhere. No connection needed.',
        icon: Wifi,
    },
];

export function FeaturesSection() {
    return (
        <section className="py-20 lg:py-28 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-14">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Built different
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        Your files stay on your device. No uploads, no servers, no limits.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="group relative bg-white border border-gray-100 rounded-2xl p-7 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {feature.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
