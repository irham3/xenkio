
import { ResizeConfig } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResizeControlsProps {
    config: ResizeConfig;
    onChange: (updates: Partial<ResizeConfig>) => void;
    onReset?: () => void;
    baseWidth?: number;
    disabled?: boolean;
}

export function ResizeControls({ config, onChange, onReset, baseWidth, disabled }: ResizeControlsProps) {
    const percentage = baseWidth ? Math.round((config.width / baseWidth) * 100) : 100;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Dimensions</span>
                {onReset && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        disabled={disabled}
                    >
                        Reset
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Width (px)</Label>
                    <Input
                        type="number"
                        value={config.width || ''}
                        onChange={(e) => onChange({ width: Number(e.target.value) })}
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <Input
                        type="number"
                        value={config.height || ''}
                        onChange={(e) => onChange({ height: Number(e.target.value) })}
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onChange({ maintainAspectRatio: !config.maintainAspectRatio })}
                    disabled={disabled}
                >
                    {config.maintainAspectRatio ? (
                        <Lock className="w-3 h-3 mr-1 text-indigo-500" />
                    ) : (
                        <Unlock className="w-3 h-3 mr-1 text-gray-400" />
                    )}
                    {config.maintainAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                </Button>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Resize</Label>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md min-w-12 text-center">
                        {percentage}%
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="200"
                    value={percentage}
                    onChange={(e) => {
                        if (!baseWidth) return;
                        const newScale = Number(e.target.value) / 100;
                        onChange({ width: Math.round(baseWidth * newScale) });
                    }}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled || !baseWidth || !config.maintainAspectRatio}
                />
                {!config.maintainAspectRatio && (
                    <p className="text-[10px] text-amber-600 mt-1">
                        Lock aspect ratio to use quick resize
                    </p>
                )}
                <div className="flex justify-between text-[10px] text-gray-400 px-1">
                    <span>1%</span>
                    <span>100%</span>
                    <span>200%</span>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label>Format</Label>
                <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={config.format}
                    onChange={(e) => onChange({ format: e.target.value as 'png' | 'jpeg' | 'webp' })}
                    disabled={disabled}
                >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                </select>
            </div>

            {(config.format === 'jpeg' || config.format === 'webp') && (
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <Label>Quality</Label>
                        <span className="text-gray-500">{config.quality}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={config.quality}
                        onChange={(e) => onChange({ quality: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}
