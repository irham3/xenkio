'use client';

import { useState } from 'react';
import { useImageResizer } from '@/features/image-resizer/hooks/use-image-resizer';
import { ImageEditor } from '@/features/image-resizer/components/image-editor';
import { ResizeControls } from '@/features/image-resizer/components/resize-controls';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ImageResizerClient() {
    const {
        imageState,
        config,
        updateConfig,
        handleFileSelect,
        imgRef,
        // previewCanvasRef, // Not showing preview canvas on UI, just using it for logic
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        generateFinalImage,
        previewUrl,
        reset
    } = useImageResizer();

    const [isCropping, setIsCropping] = useState(false);

    const handleClear = () => {
        window.location.reload(); // Simple clear for now
    };

    const handleDownload = async () => {
        const blob = await generateFinalImage();
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resized-image.${config.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Editor */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Editor</h2>
                    <ImageEditor
                        imageState={imageState}
                        crop={crop}
                        setCrop={setCrop}
                        setCompletedCrop={setCompletedCrop}
                        onFileSelect={handleFileSelect}
                        onClear={handleClear}
                        imgRef={imgRef}
                        isCropping={isCropping}
                        setIsCropping={setIsCropping}
                        previewUrl={previewUrl}
                    />
                </div>
            </div>

            {/* Right Column: Controls */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

                    {imageState.src ? (
                        <>
                            <ResizeControls
                                config={config}
                                onChange={updateConfig}
                                onReset={reset}
                                baseWidth={completedCrop ? completedCrop.width : imageState.originalWidth}
                                disabled={isCropping}
                            />

                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <Button
                                    className="w-full h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 transition-all hover:scale-[1.02]"
                                    onClick={handleDownload}
                                    disabled={isCropping}
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download Image
                                </Button>
                                {isCropping && (
                                    <p className="text-xs text-center text-accent-600 mt-2 bg-accent-50 py-1 px-2 rounded">
                                        Finish cropping to download
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p>Upload an image to unlock controls</p>
                        </div>
                    )}
                </div>

                {/* Instructions or Info */}
                <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                    <h3 className="font-medium text-primary-900 mb-2">Pro Tip</h3>
                    <p className="text-sm text-primary-700 leading-relaxed">
                        Use the crop tool to focus on the most important part of your image before resizing.
                    </p>
                </div>
            </div>

            {/* Hidden Canvas for pure logic if needed, although we create one on the fly for download */}
        </div>
    );
}
