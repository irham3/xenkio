
'use client';

import { QRConfig } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import Image from 'next/image';

interface QrLogoUploaderProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export function QrLogoUploader({ config, onChange }: QrLogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          imageSettings: {
            src: reader.result as string,
            height: 40,
            width: 40,
            excavate: true,
            opacity: 1,
            borderRadius: 8,
            borderSize: 2,
            borderColor: '#ffffff',
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onChange({ imageSettings: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateImageSettings = (updates: Partial<NonNullable<QRConfig['imageSettings']>>) => {
    if (!config.imageSettings) return;
    onChange({
      imageSettings: {
        ...config.imageSettings,
        ...updates,
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Logo Customization</h3>
        {config.imageSettings?.src && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeLogo}
            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {!config.imageSettings?.src ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Drop your logo here</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG or SVG up to 2MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
              <Image
                src={config.imageSettings.src}
                alt="Logo preview"
                width={64}
                height={64}
                unoptimized
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Active Logo</p>
              <p className="text-xs text-gray-500">Customize how it looks on QR</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <Label>Logo Size</Label>
                  <span className="text-gray-500">{config.imageSettings.width}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={config.imageSettings.width}
                  onChange={(e) => updateImageSettings({
                    width: Number(e.target.value),
                    height: Number(e.target.value),
                  })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <Label>Corner Radius</Label>
                  <span className="text-gray-500">{config.imageSettings.borderRadius || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={config.imageSettings.borderRadius || 0}
                  onChange={(e) => updateImageSettings({ borderRadius: Number(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <Label>Opacity</Label>
                  <span className="text-gray-500">{Math.round((config.imageSettings.opacity || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={(config.imageSettings.opacity || 1) * 100}
                  onChange={(e) => updateImageSettings({ opacity: Number(e.target.value) / 100 })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <Label>Border Size</Label>
                  <span className="text-gray-500">{config.imageSettings.borderSize || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.imageSettings.borderSize || 0}
                  onChange={(e) => updateImageSettings({ borderSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Border Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.imageSettings.borderColor || '#ffffff'}
                    onChange={(e) => updateImageSettings({ borderColor: e.target.value })}
                    className="h-8 w-8 rounded border p-0.5"
                  />
                  <input
                    type="text"
                    value={config.imageSettings.borderColor || '#ffffff'}
                    onChange={(e) => updateImageSettings({ borderColor: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="excavate"
                  checked={config.imageSettings.excavate}
                  onChange={(e) => updateImageSettings({ excavate: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="excavate" className="text-xs cursor-pointer">Remove dots behind logo</Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
