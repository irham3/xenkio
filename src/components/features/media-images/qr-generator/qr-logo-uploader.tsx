
'use client';

import { QRConfig } from '../../../../features/qr-generator/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

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
                        height: 24,
                        width: 24,
                        excavate: true,
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Logo (Optional)</Label>
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
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Click to upload logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 relative bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={config.imageSettings.src} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Logo Uploaded</p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Size</Label>
                                <Input
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={config.imageSettings.width}
                                    onChange={(e) => onChange({
                                        imageSettings: {
                                            ...config.imageSettings!,
                                            width: Number(e.target.value),
                                            height: Number(e.target.value),
                                        }
                                    })}
                                    className="h-7 w-20 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
