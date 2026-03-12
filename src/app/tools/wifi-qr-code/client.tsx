'use client';

import { useWifiQrGenerator } from '@/features/wifi-qr-code/hooks/use-wifi-qr-generator';
import { WifiQrForm } from '@/features/wifi-qr-code/components/wifi-qr-form';
import { WifiQrCustomizer } from '@/features/wifi-qr-code/components/wifi-qr-customizer';
import { WifiQrPreview } from '@/features/wifi-qr-code/components/wifi-qr-preview';

export function WifiQrCodeClient() {
    const { config, updateConfig, downloadQr } = useWifiQrGenerator();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-8">
                {/* WiFi Details Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
                        WiFi Details
                    </h2>
                    <WifiQrForm config={config} onChange={updateConfig} />
                </div>

                {/* Customization Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                        Customization
                    </h2>
                    <WifiQrCustomizer config={config} onChange={updateConfig} />
                </div>
            </div>

            {/* Preview Column (Sticky) */}
            <div className="lg:col-span-5">
                <div className="sticky top-24">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-6">Preview</h2>
                        <WifiQrPreview config={config} onDownload={downloadQr} />
                    </div>
                </div>
            </div>
        </div>
    );
}
