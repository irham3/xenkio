
import { useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Upload, X, Crop as CropIcon } from 'lucide-react';
import { ImageState } from '../types';

interface ImageEditorProps {
    imageState: ImageState;
    crop?: Crop;
    setCrop: (crop: Crop) => void;
    setCompletedCrop: (crop: PixelCrop) => void;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    imgRef: React.RefObject<HTMLImageElement | null>;
    isCropping: boolean;
    setIsCropping: (v: boolean) => void;
    previewUrl?: string | null;
}

export function ImageEditor({
    imageState,
    crop,
    setCrop,
    setCompletedCrop,
    onFileSelect,
    onClear,
    imgRef,
    isCropping,
    setIsCropping,
    previewUrl
}: ImageEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!imageState.src) {
        return (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group h-[400px]"
            >
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload an Image</h3>
                <p className="text-sm text-gray-500 mb-4">JPG, PNG or WEBP</p>
                <Button variant="outline" className="pointer-events-none">
                    Select File
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
                    }}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="h-9 text-error-500 hover:text-error-600 hover:bg-error-50 px-3 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>

                <Button
                    variant={isCropping ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                        if (!isCropping && !crop) {
                            setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
                        }
                        setIsCropping(!isCropping);
                    }}
                    className={`h-9 gap-2 px-4 rounded-lg shadow-sm transition-all ${isCropping ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                >
                    <CropIcon className="w-4 h-4" />
                    {isCropping ? 'Done' : 'Crop Image'}
                </Button>
            </div>

            {/* Editor Area */}
            <div className="relative bg-gray-900/5 rounded-xl border border-gray-200 overflow-hidden min-h-[400px] flex items-center justify-center p-4">
                {isCropping ? (
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={undefined} // Free crop by default
                        className="max-h-[600px]"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageState.src}
                            style={{ maxHeight: '600px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                    </ReactCrop>
                ) : (
                    <div className="relative max-h-[600px] w-full flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl || imageState.src}
                            alt="Preview"
                            className="max-h-[600px] max-w-full object-contain rounded-md shadow-sm"
                        />
                        {/* Hidden img ref for resizing operations even when not cropping */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            src={imageState.src}
                            className="hidden"
                            alt="hidden-source"
                        />
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-gray-500">
                Original: {imageState.originalWidth} x {imageState.originalHeight}px
            </p>
        </div>
    );
}
