'use client';

import { DUMMY_TOOLS } from '@/data/dummy-tools';
import { useQrGenerator } from '@/features/qr-generator/hooks/use-qr-generator';
import { QrGeneratorForm } from '@/components/features/media-images/qr-generator/qr-generator-form';
import { QrCustomizer } from '@/components/features/media-images/qr-generator/qr-customizer';
import { QrPreview } from '@/components/features/media-images/qr-generator/qr-preview';
import { QrLogoUploader } from '@/components/features/media-images/qr-generator/qr-logo-uploader';

export default function QrGeneratorPage() {
    const slug = 'qr-code-generator';
    const tool = DUMMY_TOOLS.find(t => t.slug === slug);

    // Hook for QR Generator logic
    const { config, updateConfig, downloadQr } = useQrGenerator();

    if (!tool) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900">Tool Not Found</h1>
                <p className="mt-4 text-gray-600">The tool configuration seems to be missing.</p>
            </div>
        );
    }

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
