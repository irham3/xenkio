'use client';

import { useBarcodeGenerator } from '../hooks/use-barcode-generator';
import { BARCODE_FORMATS } from '../constants';
import { BarcodeFormat } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileImage, FileCode, AlertCircle } from 'lucide-react';

export function BarcodeGenerator() {
    const { config, updateConfig, canvasRef, error, downloadBarcode } = useBarcodeGenerator();

    const currentFormat = BARCODE_FORMATS.find((f) => f.value === config.format);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Column */}
            <div className="lg:col-span-7 space-y-8">
                {/* Section 1: Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
                        Content
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="barcode-format">Barcode Format</Label>
                            <select
                                id="barcode-format"
                                value={config.format}
                                onChange={(e) =>
                                    updateConfig({ format: e.target.value as BarcodeFormat })
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                                {BARCODE_FORMATS.map((format) => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barcode-value">Value</Label>
                            <Input
                                id="barcode-value"
                                value={config.value}
                                onChange={(e) => updateConfig({ value: e.target.value })}
                                placeholder={currentFormat?.placeholder ?? 'Enter value'}
                                className="w-full"
                            />
                            <p className="text-sm text-gray-500">
                                Enter the data to encode as a {currentFormat?.label ?? 'barcode'}.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Customization */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                        Customization
                    </h2>
                    <div className="space-y-6">
                        {/* Dimensions */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900">Dimensions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Bar Width ({config.width}px)</Label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="0.5"
                                        value={config.width}
                                        onChange={(e) =>
                                            updateConfig({ width: parseFloat(e.target.value) })
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Height ({config.height}px)</Label>
                                    <input
                                        type="range"
                                        min="30"
                                        max="200"
                                        value={config.height}
                                        onChange={(e) =>
                                            updateConfig({ height: parseInt(e.target.value) })
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">Colors</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Bar Color</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.lineColor}
                                            onChange={(e) =>
                                                updateConfig({ lineColor: e.target.value })
                                            }
                                            className="h-9 w-9 rounded border p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.lineColor}
                                            onChange={(e) =>
                                                updateConfig({ lineColor: e.target.value })
                                            }
                                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Background</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.background}
                                            onChange={(e) =>
                                                updateConfig({ background: e.target.value })
                                            }
                                            className="h-9 w-9 rounded border p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.background}
                                            onChange={(e) =>
                                                updateConfig({ background: e.target.value })
                                            }
                                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Options */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">Text</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="display-value"
                                        checked={config.displayValue}
                                        onChange={(e) =>
                                            updateConfig({ displayValue: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Label htmlFor="display-value" className="text-sm text-gray-700">
                                        Show text below barcode
                                    </Label>
                                </div>

                                {config.displayValue && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs">
                                                Font Size ({config.fontSize}px)
                                            </Label>
                                            <input
                                                type="range"
                                                min="8"
                                                max="32"
                                                value={config.fontSize}
                                                onChange={(e) =>
                                                    updateConfig({
                                                        fontSize: parseInt(e.target.value),
                                                    })
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">
                                                Text Margin ({config.textMargin}px)
                                            </Label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                value={config.textMargin}
                                                onChange={(e) =>
                                                    updateConfig({
                                                        textMargin: parseInt(e.target.value),
                                                    })
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Column (Sticky) */}
            <div className="lg:col-span-5">
                <div className="sticky top-24">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold mb-6">Preview</h2>
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
                            <div
                                className={cn(
                                    'flex items-center justify-center bg-white p-4 rounded-xl shadow-sm overflow-auto max-w-full',
                                    error && 'opacity-50'
                                )}
                            >
                                <canvas ref={canvasRef} />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid w-full grid-cols-2 gap-3 max-w-xs">
                                <Button
                                    onClick={() => downloadBarcode('png')}
                                    disabled={!!error}
                                    className="w-full"
                                >
                                    <FileImage className="mr-2 h-4 w-4" />
                                    PNG
                                </Button>
                                <Button
                                    onClick={() => downloadBarcode('svg')}
                                    disabled={!!error}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <FileCode className="mr-2 h-4 w-4" />
                                    SVG
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
