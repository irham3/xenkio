'use client';

import { useQrGenerator } from '@/features/qr-generator/hooks/use-qr-generator';
import { QrGeneratorForm } from '@/features/qr-generator/components/qr-generator-form';
import { QrCustomizer } from '@/features/qr-generator/components/qr-customizer';
import { QrPreview } from '@/features/qr-generator/components/qr-preview';
import { QrLogoUploader } from '@/features/qr-generator/components/qr-logo-uploader';

export function QrGeneratorClient() {
  // Hook for QR Generator logic
  const { config, updateConfig, downloadQr } = useQrGenerator();

  return (
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
  );
}
