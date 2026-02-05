import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ConversionOptions, ImageFormat } from "../types"
import { Loader2, RefreshCw } from "lucide-react"

interface ImageSettingsProps {
    options: ConversionOptions
    onOptionsChange: (options: ConversionOptions) => void
    isProcessing: boolean
    onConvert: () => void
    onReset: () => void
    hasImages: boolean
}

export function ImageSettings({
    options,
    onOptionsChange,
    isProcessing,
    onConvert,
    onReset,
    hasImages
}: ImageSettingsProps) {
    const handleFormatChange = (value: ImageFormat) => {
        onOptionsChange({ ...options, targetFormat: value })
    }

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-24">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Conversion Settings</h3>
                <p className="text-sm text-gray-500">Configure your output format</p>
            </div>

            <div className="space-y-2">
                <Label>Target Format</Label>
                <div className="relative">
                    <select
                        value={options.targetFormat}
                        onChange={(e) => handleFormatChange(e.target.value as ImageFormat)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                        <option value="jpeg">JPG / JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                        <option value="bmp">BMP</option>
                        <option value="ico">ICO</option>
                        <option value="svg">SVG (from vectors)</option>
                        <option value="gif">GIF</option>
                        <option value="tiff">TIFF</option>
                        <option value="avif">AVIF</option>
                        <option value="heic">HEIC</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
            </div>

            {
                (options.targetFormat === 'jpeg' || options.targetFormat === 'webp') && (
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between">
                            <Label>Quality</Label>
                            <span className="text-xs text-gray-500 font-medium">
                                {Math.round(options.quality * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={options.quality}
                            onChange={(e) => onOptionsChange({ ...options, quality: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <p className="text-xs text-gray-400">
                            Lower quality reduces file size significantly.
                        </p>
                    </div>
                )
            }

            <div className="pt-4 space-y-3">
                <Button
                    className="w-full h-11"
                    onClick={onConvert}
                    disabled={!hasImages || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Converting...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Convert Images
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onReset}
                    disabled={!hasImages && !isProcessing}
                >
                    Reset All
                </Button>
            </div>
        </div >
    )
}
