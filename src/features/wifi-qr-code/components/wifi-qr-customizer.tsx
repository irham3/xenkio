'use client';

import { WifiQrConfig } from '../types';
import { Label } from '@/components/ui/label';

interface WifiQrCustomizerProps {
    config: WifiQrConfig;
    onChange: (updates: Partial<WifiQrConfig>) => void;
}

const ERROR_LEVELS = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
] as const;

export function WifiQrCustomizer({ config, onChange }: WifiQrCustomizerProps) {
    return (
        <div className="space-y-6">
            {/* Colors */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Foreground</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.fgColor}
                                onChange={(e) => onChange({ fgColor: e.target.value })}
                                className="h-8 w-8 rounded border p-0.5"
                            />
                            <input
                                type="text"
                                value={config.fgColor}
                                onChange={(e) => onChange({ fgColor: e.target.value })}
                                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs uppercase"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Background</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.bgColor}
                                onChange={(e) => onChange({ bgColor: e.target.value })}
                                className="h-8 w-8 rounded border p-0.5"
                            />
                            <input
                                type="text"
                                value={config.bgColor}
                                onChange={(e) => onChange({ bgColor: e.target.value })}
                                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Options</h3>

                <div className="space-y-2">
                    <Label>Error Correction Level</Label>
                    <select
                        value={config.level}
                        onChange={(e) => onChange({ level: e.target.value as WifiQrConfig['level'] })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                        {ERROR_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">
                        Higher levels make the QR code more resistant to damage or obstruction.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="wifi-qr-margin"
                        checked={config.includeMargin}
                        onChange={(e) => onChange({ includeMargin: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Label htmlFor="wifi-qr-margin" className="cursor-pointer">
                        Include White Margin
                    </Label>
                </div>
            </div>
        </div>
    );
}
