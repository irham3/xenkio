import { Label } from '@/components/ui/label';
import { ConversionOptions, ImageFormat } from '../types';
import { Settings2, Download, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ConversionControlsProps {
    options: ConversionOptions;
    onChange: (options: ConversionOptions) => void;
    disabled?: boolean;
    onConvert: () => void;
    isProcessing: boolean;
    progress?: number;
    converted?: boolean;
}

export function ConversionControls({
    options,
    onChange,
    disabled,
    onConvert,
    isProcessing,
    progress = 0,
    converted = false
}: ConversionControlsProps) {
    const handleFormatChange = (value: ImageFormat) => {
        onChange({ ...options, format: value });
    };

    const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...options, quality: parseFloat(e.target.value) });
    };

    const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...options, scale: parseFloat(e.target.value) });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Settings2 className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-gray-900">Conversion Settings</h2>
            </div>

            <div className="space-y-6">
                {/* Format Selection */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Format</Label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                        {['jpg', 'png'].map((fmt) => (
                            <button
                                key={fmt}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleFormatChange(fmt as ImageFormat)}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 uppercase",
                                    options.format === fmt
                                        ? "bg-white text-primary-600 shadow-sm ring-1 ring-gray-200"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                    {/* Format Description */}
                    <p className="text-xs text-gray-500">
                        {options.format === 'jpg' ? 'Best for photos & web. Smaller size.' : 'Best for text & sharpness. Lossless.'}
                    </p>
                </div>

                {/* Quality Slider (JPG only) */}
                <div className={cn("space-y-3 transition-opacity duration-200", options.format === 'png' && "hidden")}>
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image Quality</Label>
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                            {Math.round(options.quality * 100)}%
                        </span>
                    </div>
                    <div className="pt-2">
                        <input
                            type="range"
                            disabled={disabled || options.format === 'png'}
                            value={options.quality}
                            onChange={handleQualityChange}
                            max={1}
                            min={0.1}
                            step={0.1}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Lower quality reduces file size significantly.
                    </p>
                </div>

                {/* Resolution Selection */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolution (DPI)</Label>
                    <div className="relative">
                        <select
                            disabled={disabled}
                            value={options.scale.toString()}
                            onChange={handleScaleChange}
                            className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow cursor-pointer appearance-none"
                        >
                            <option value="1">Standard (72 DPI)</option>
                            <option value="1.5">High (108 DPI)</option>
                            <option value="2">Pro (144 DPI)</option>
                            <option value="3">Ultra (216 DPI)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Higher resolution means sharper text but larger files.
                    </p>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                    <Button
                        className={cn(
                            "w-full h-12 text-base font-semibold shadow-lg transition-all duration-300",
                            isProcessing ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20 hover:shadow-primary-600/30 hover:-translate-y-0.5"
                        )}
                        size="lg"
                        onClick={onConvert}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {progress > 0 ? `Converting ${progress}%` : 'Processing...'}
                            </>
                        ) : converted ? (
                            <>
                                <RotateCcw className="mr-2 h-5 w-5" />
                                Convert Again
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Convert PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
