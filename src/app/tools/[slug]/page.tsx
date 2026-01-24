
'use client';

import { useParams } from 'next/navigation';
import { DUMMY_TOOLS } from '@/data/dummy-tools';
import { useQrGenerator } from '@/features/qr-generator/hooks/use-qr-generator';
import { QrGeneratorForm } from '@/features/qr-generator/components/qr-generator-form';
import { QrCustomizer } from '@/features/qr-generator/components/qr-customizer';
import { QrPreview } from '@/features/qr-generator/components/qr-preview';
import { QrLogoUploader } from '@/features/qr-generator/components/qr-logo-uploader';

export default function ToolPage() {
    const params = useParams();
    const slug = params.slug as string;
    const tool = DUMMY_TOOLS.find(t => t.slug === slug);

    // Hook for QR Generator logic
    const { config, updateConfig, downloadQr } = useQrGenerator();

    if (!tool) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900">Tool Not Found</h1>
                <p className="mt-4 text-gray-600">The tool you are looking for does not exist.</p>
            </div>
        );
    }

    // If this is the QR generator page, render the feature
    if (slug === 'qr-code-generator') {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Tool Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
                </div>

                {/* Feature UI */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls Column */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
                                Content
                            </h2>
                            <QrGeneratorForm config={config} onChange={updateConfig} />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                                Customization
                            </h2>
                            <QrCustomizer config={config} onChange={updateConfig} />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">3</span>
                                Logo (Optional)
                            </h2>
                            <QrLogoUploader config={config} onChange={updateConfig} />
                        </div>
                    </div>

                    {/* Preview Column (Sticky) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                                <h2 className="text-lg font-semibold mb-6">Preview</h2>
                                <QrPreview config={config} onDownload={downloadQr} />
                            </div>
                        </div>
                    </div>
                </div>
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
