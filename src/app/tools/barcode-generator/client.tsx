'use client';

import { useBarcodeGenerator } from '@/features/barcode-generator/hooks/use-barcode-generator';
import { BarcodeForm } from '@/features/barcode-generator/components/barcode-form';
import { BarcodeCustomizer } from '@/features/barcode-generator/components/barcode-customizer';
import { BarcodePreview } from '@/features/barcode-generator/components/barcode-preview';

export function BarcodeGeneratorClient() {
    const { config, updateConfig } = useBarcodeGenerator();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-8">
                {/* Content Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
                        Content
                    </h2>
                    <BarcodeForm config={config} onChange={updateConfig} />
                </div>

                {/* Customization Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                        Customization
                    </h2>
                    <BarcodeCustomizer config={config} onChange={updateConfig} />
                </div>
            </div>

            {/* Preview Column (Sticky) */}
            <div className="lg:col-span-5">
                <div className="sticky top-24">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold mb-6">Preview</h2>
                        <BarcodePreview config={config} />
                    </div>

                    {/* Tips / Info */}
                    {/* <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-sm text-blue-800">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                            Supported Formats
                        </h3>
                        <p className="leading-relaxed opacity-90">
                            We support all major barcode types including EAN-13, UPC, Code 128, Code 39, and ITF-14.
                            The preview updates instantly as you type.
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
