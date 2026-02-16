'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop';
import { useDropzone } from 'react-dropzone';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    RotateCw,
    Download,
    Upload,
    Trash2,
    Crop as CropIcon,
    ZoomIn,
    Monitor,
    Smartphone,
    Square,
    Settings2,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { canvasPreview, downloadCrop } from '../lib/crop-utils';
import { cn } from '@/lib/utils';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to center the crop initially
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

const ASPECTS = [
    { value: 0, label: 'Free / Custom', icon: CropIcon },
    { value: 1, label: 'Square (1:1)', icon: Square },
    { value: 4 / 5, label: 'Instagram Portrait (4:5)', icon: Smartphone },
    { value: 1.91 / 1, label: 'Instagram Landscape (1.91:1)', icon: Monitor },
    { value: 16 / 9, label: 'Landscape (16:9)', icon: Monitor },
    { value: 4 / 3, label: 'Standard (4:3)', icon: Monitor },
    { value: 9 / 16, label: 'Portrait (9:16)', icon: Smartphone },
    { value: 3 / 4, label: 'Portrait (3:4)', icon: Smartphone },
    { value: 2 / 1, label: 'Twitter Header (2:1)', icon: Monitor },
];

export default function ImageCropper() {
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Controls
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [fileName, setFileName] = useState('cropped-image');

    const onSelectFile = (file: File) => {
        if (!file) return;

        setFileName(file.name.replace(/\.[^/.]+$/, ""));

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const imageElement = new Image();
            const imageUrl = reader.result?.toString() || '';
            imageElement.src = imageUrl;

            imageElement.addEventListener('load', (e) => {
                if (aspect) {
                    const { naturalWidth: width, naturalHeight: height } = e.currentTarget as HTMLImageElement;
                    const crop = centerAspectCrop(width, height, aspect);
                    setCrop(crop);
                }
            });

            setImgSrc(imageUrl);
            setScale(1);
            setRotate(0);
        });
        reader.readAsDataURL(file);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles?.[0]) {
                onSelectFile(acceptedFiles[0]);
            }
        },
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: false
    });

    // Handle Image Load
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    // Effect for updating preview canvas
    useEffect(() => {
        if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current
        ) {
            // We use the canvasPreview function from utils
            canvasPreview(
                imgRef.current,
                previewCanvasRef.current,
                completedCrop,
                scale,
                rotate,
            );
        }
    }, [completedCrop, scale, rotate]);

    const handleDownload = async () => {
        if (!imgRef.current || !completedCrop) {
            toast.error('Crop not ready');
            return;
        }

        try {
            await downloadCrop(
                imgRef.current,
                completedCrop,
                `${fileName}-cropped.png`,
                scale,
                rotate,
                0.9 // Default quality
            );
            toast.success('Image downloaded successfully!');
        } catch (e) {
            console.error(e);
            toast.error('Error downloading crop');
        }
    };

    const handleAspectChange = (value: string) => {
        const val = Number(value);
        if (val === 0) {
            setAspect(undefined);
        } else {
            setAspect(val);
            if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(centerAspectCrop(width, height, val));
            }
        }
    };

    const reset = () => {
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setScale(1);
        setRotate(0);
        setAspect(undefined);
    };

    if (!imgSrc) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer",
                        isDragActive
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                            isDragActive ? "bg-primary-100" : "bg-gray-100"
                        )}>
                            <Upload className={cn(
                                "w-10 h-10 transition-colors",
                                isDragActive ? "text-primary-600" : "text-gray-400"
                            )} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-900">
                                {isDragActive ? "Drop your image here" : "Select an image to crop"}
                            </p>
                            <p className="text-gray-500">
                                or drag and drop image file here
                            </p>
                        </div>
                        <Button size="lg" className="mt-4 pointer-events-none">
                            <Plus className="w-4 h-4 mr-2" />
                            Select Image
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Editor Area */}
            <div className="lg:col-span-3 space-y-4">
                <div
                    className="relative min-h-[500px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden"
                >
                    <div className="relative w-full h-full p-8 flex items-center justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            className="max-h-[600px]"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={onImageLoad}
                                className="max-w-full max-h-[600px] object-contain shadow-lg rounded-sm"
                            />
                        </ReactCrop>
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 sticky top-6 h-fit lg:col-span-1">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Settings2 className="w-5 h-5 text-primary-600" />
                    <h2 className="font-semibold">Settings</h2>

                    {imgSrc && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={reset}
                            className="ml-auto h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            title="Reset all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>

                {/* PREVIEW CARD */}
                {!!completedCrop && (
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</Label>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col items-center justify-center space-y-2">
                            <canvas
                                ref={previewCanvasRef}
                                className="border border-gray-200 border-dashed rounded-lg object-contain max-h-[150px] max-w-full bg-[url('/transparent-grid.svg')]"
                                style={{
                                    width: completedCrop?.width ? Math.round(completedCrop.width) : 'auto',
                                    height: completedCrop?.height ? Math.round(completedCrop.height) : 'auto',
                                }}
                            />
                            <p className="text-[10px] text-gray-400 font-mono">
                                {completedCrop ? `${Math.round(completedCrop.width)} x ${Math.round(completedCrop.height)} px` : ''}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aspect Ratio</Label>
                        <Select value={aspect?.toString() || "0"} onValueChange={handleAspectChange}>
                            <SelectTrigger className="w-full cursor-pointer bg-gray-50/50 border-gray-200">
                                <SelectValue placeholder="Select ratio" />
                            </SelectTrigger>
                            <SelectContent>
                                {ASPECTS.map((a) => (
                                    <SelectItem key={a.value} value={a.value.toString()} className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <a.icon className="w-4 h-4 opacity-50" />
                                            {a.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Zoom / Scale */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom</Label>
                            <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{scale.toFixed(1)}x</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ZoomIn className="w-4 h-4 text-gray-400" />
                            <Slider
                                value={[scale]}
                                min={0.1}
                                max={3}
                                step={0.1}
                                onValueChange={(vals) => setScale(vals[0])}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Rotate */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rotation</Label>
                            <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{rotate}°</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <RotateCw className="w-4 h-4 text-gray-400" />
                            <Slider
                                value={[rotate]}
                                min={-180}
                                max={180}
                                step={1}
                                onValueChange={(vals) => setRotate(vals[0])}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-2 justify-between pt-1">
                            <Button variant="outline" size="sm" onClick={() => setRotate((r) => r - 90)} className="flex-1 h-7 text-[10px] cursor-pointer">-90°</Button>
                            <Button variant="outline" size="sm" onClick={() => setRotate(0)} className="flex-1 h-7 text-[10px] cursor-pointer">0°</Button>
                            <Button variant="outline" size="sm" onClick={() => setRotate((r) => r + 90)} className="flex-1 h-7 text-[10px] cursor-pointer">+90°</Button>
                        </div>
                    </div>
                </div>

                {/* Download */}
                <div className="pt-4 border-t border-gray-100">
                    <Button
                        onClick={handleDownload}
                        size="lg"
                        disabled={!completedCrop || !imgSrc}
                        className="w-full h-12 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 cursor-pointer disabled:opacity-50"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download Crop
                    </Button>
                </div>
            </div>
        </div>
    );
}
