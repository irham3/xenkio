'use client';
// Force TS re-check

import { BarcodeConfig } from '../types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BarcodeCustomizerProps {
    config: BarcodeConfig;
    onChange: (updates: Partial<BarcodeConfig>) => void;
}

export function BarcodeCustomizer({ config, onChange }: BarcodeCustomizerProps) {
    return (
        <div className="space-y-6">
            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Width (Scale)</Label>
                    <div className="flex items-center space-x-4">
                        <Slider
                            value={[config.width]}
                            min={1}
                            max={4}
                            step={0.5}
                            onValueChange={([val]: number[]) => onChange({ width: val })}
                            className="flex-1"
                        />
                        <span className="text-sm font-medium w-8 text-right">
                            {config.width}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Height</Label>
                    <div className="flex items-center space-x-4">
                        <Slider
                            value={[config.height]}
                            min={10}
                            max={150}
                            step={10}
                            onValueChange={([val]: number[]) => onChange({ height: val })}
                            className="flex-1"
                        />
                        <span className="text-sm font-medium w-8 text-right">
                            {config.height}
                        </span>
                    </div>
                </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
                <Label>Margin</Label>
                <div className="flex items-center space-x-4">
                    <Slider
                        value={[config.margin]}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={([val]: number[]) => onChange({ margin: val })}
                        className="flex-1"
                    />
                    <span className="text-sm font-medium w-8 text-right">
                        {config.margin}
                    </span>
                </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="line-color">Line Color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="line-color"
                            type="color"
                            value={config.lineColor}
                            onChange={(e) => onChange({ lineColor: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={config.lineColor}
                            onChange={(e) => onChange({ lineColor: e.target.value })}
                            className="flex-1 font-mono uppercase"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="bg-color"
                            type="color"
                            value={config.background}
                            onChange={(e) => onChange({ background: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={config.background}
                            onChange={(e) => onChange({ background: e.target.value })}
                            className="flex-1 font-mono uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Text Options */}
            {config.displayValue && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Text Options</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Font Size</Label>
                            <div className="flex items-center space-x-4">
                                <Slider
                                    value={[config.fontSize]}
                                    min={8}
                                    max={36}
                                    step={1}
                                    onValueChange={([val]: number[]) => onChange({ fontSize: val })}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-8 text-right">
                                    {config.fontSize}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Text Align</Label>
                            <Select
                                value={config.textAlign}
                                onValueChange={(val) => onChange({ textAlign: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Font Style */}
                        <div className="space-y-2">
                            <Label>Font Style</Label>
                            <Select
                                value={config.fontOptions || "normal"}
                                onValueChange={(val) => onChange({ fontOptions: val === "normal" ? "" : val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Normal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="bold">Bold</SelectItem>
                                    <SelectItem value="italic">Italic</SelectItem>
                                    <SelectItem value="bold italic">Bold Italic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
