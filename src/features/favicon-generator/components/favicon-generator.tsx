
'use client';

import React from 'react';
import { useFaviconGenerator } from '../hooks/use-favicon-generator';
import { FaviconSettings } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Upload,
    Download,
    RefreshCcw,
    Image as ImageIcon,
    Check,
    Settings2,
    Monitor,
    Smartphone,
    Apple
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function FaviconGenerator() {
    const {
        file,
        previewUrl,
        isProcessing,
        result,
        settings,
        setSettings,
        handleFileChange,
        generateFavicons,
        downloadZip,
        reset,
    } = useFaviconGenerator();

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileChange(acceptedFiles[0]);
        }
    }, [handleFileChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    });

    const updateSetting = <K extends keyof FaviconSettings>(key: K, value: FaviconSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Sidebar - 4 cols */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 border-gray-100 shadow-soft">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings2 className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-gray-900">Customization</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Border Radius */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium text-gray-700">Border Radius</Label>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {settings.borderRadius}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.borderRadius]}
                                    onValueChange={([val]) => updateSetting('borderRadius', val)}
                                    max={50}
                                    step={1}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Padding */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium text-gray-700">Padding</Label>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {settings.padding}%
                                    </span>
                                </div>
                                <Slider
                                    value={[settings.padding]}
                                    onValueChange={([val]) => updateSetting('padding', val)}
                                    max={40}
                                    step={1}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Background Color */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">Background</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['transparent', '#ffffff', '#000000', '#0ea5e9', '#f97316', '#22c55e'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => updateSetting('backgroundColor', color)}
                                            className={cn(
                                                "w-8 h-8 rounded-full border border-gray-200 transition-all hover:scale-110",
                                                settings.backgroundColor === color && "ring-2 ring-primary ring-offset-2 scale-110"
                                            )}
                                            style={{
                                                backgroundColor: color === 'transparent' ? 'white' : color,
                                                backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                                backgroundSize: color === 'transparent' ? '10px 10px' : 'auto',
                                                backgroundPosition: color === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : 'auto'
                                            }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Inclusion Toggles */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Apple className="w-4 h-4 text-gray-400" />
                                        <Label className="text-sm text-gray-600">iOS Icons</Label>
                                    </div>
                                    <Switch
                                        checked={settings.includeApple}
                                        onCheckedChange={(val) => updateSetting('includeApple', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-gray-400" />
                                        <Label className="text-sm text-gray-600">Android Icons</Label>
                                    </div>
                                    <Switch
                                        checked={settings.includeAndroid}
                                        onCheckedChange={(val) => updateSetting('includeAndroid', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-gray-400" />
                                        <Label className="text-sm text-gray-600">Desktop ICO</Label>
                                    </div>
                                    <Switch
                                        checked={settings.includeMS}
                                        onCheckedChange={(val) => updateSetting('includeMS', val)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Viewport - 8 cols */}
                <div className="lg:col-span-8 space-y-6">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "relative group cursor-pointer h-[400px] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-12 text-center",
                                isDragActive
                                    ? "border-primary bg-primary-50/30 scale-[0.99]"
                                    : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50/50"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                                <Upload className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Your Favicon</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Drag and drop your logo (PNG, JPG, SVG) here to create a full set of icons
                            </p>
                        </div>
                    ) : (
                        <Card className="overflow-hidden border-gray-100 shadow-medium h-fit min-h-[400px] flex flex-col bg-white">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={reset} className="text-gray-500 hover:text-error-600">
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Change
                                    </Button>
                                    {!result && (
                                        <Button
                                            size="sm"
                                            onClick={generateFavicons}
                                            disabled={isProcessing}
                                            className="bg-primary hover:bg-primary-700 shadow-primary"
                                        >
                                            {isProcessing ? "Processing..." : "Generate Favicons"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Preview Area */}
                            <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                                {!result ? (
                                    <div className="relative z-10 flex flex-col items-center space-y-6">
                                        <div className="relative group">
                                            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100" />
                                            <div
                                                className="relative w-48 h-48 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 border border-gray-100"
                                                style={{ borderRadius: `${settings.borderRadius}%` }}
                                            >
                                                <div
                                                    className="w-full h-full relative"
                                                    style={{
                                                        padding: `${settings.padding}%`,
                                                        backgroundColor: settings.backgroundColor === 'transparent' ? 'transparent' : settings.backgroundColor
                                                    }}
                                                >
                                                    {previewUrl && (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white px-4 py-2 rounded-full shadow-soft border border-gray-100 text-sm font-medium text-gray-500">
                                            Live Preview
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full overflow-y-auto scrollbar-themed p-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                            {result.files.map((f, i) => (
                                                <div key={i} className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                                    <div className="w-24 h-24 bg-white rounded-xl shadow-soft border border-gray-100 flex items-center justify-center p-2 group hover:border-primary/30 transition-colors">
                                                        <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
                                                            <Image
                                                                src={URL.createObjectURL(f.blob)}
                                                                alt={f.name}
                                                                width={96}
                                                                height={96}
                                                                unoptimized
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <p className="text-xs font-bold text-gray-700 truncate w-24 px-1">{f.name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase font-mono">{f.width}x{f.height}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Action */}
                            {result && (
                                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span>Full set of {result.files.length} icons generated</span>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={reset}
                                            className="flex-1 md:flex-none border-gray-200"
                                        >
                                            Restart
                                        </Button>
                                        <Button
                                            size="lg"
                                            onClick={downloadZip}
                                            className="flex-1 md:flex-none bg-primary hover:bg-primary-700 shadow-primary animate-pulse-slow"
                                        >
                                            <Download className="w-5 h-5 mr-3" />
                                            Download Pack (.ZIP)
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* SEO / Info Section (Premium Look) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900">Standard Sizes Included</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Our generator creates a comprehensive pack that follows all modern standards for browsers, social media, and operating systems.
                            </p>
                            <ul className="space-y-2">
                                {[
                                    '16x16 / 32x32: Standard web browsers',
                                    '180x180: Apple iPhone touch icons',
                                    '192x192 / 512x512: Android PWA & Chrome',
                                    'favicon.ico: Legacy browser compatibility'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-primary/5 rounded-3xl p-6 space-y-4 border border-primary/10">
                            <h4 className="text-lg font-bold text-primary">Pro Tip: Transparency</h4>
                            <p className="text-sm text-primary/80 leading-relaxed">
                                For the most professional look, use a high-quality PNG with a transparent background.
                                Our generator will help you add consistent padding and rounding if needed to match your brand identity across all platforms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
