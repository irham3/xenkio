"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Plus, Trash2 } from "lucide-react"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { ConversionOptions, ImageFile } from "@/features/image-converter/types"
import { ImageUploader } from "@/features/image-converter/components/image-uploader"
import { ImageGrid } from "@/features/image-converter/components/image-grid"
import { ImageSettings } from "@/features/image-converter/components/image-settings"

export function ImageConverterClient() {
    const [images, setImages] = useState<ImageFile[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [options, setOptions] = useState<ConversionOptions>({
        targetFormat: "jpeg",
        quality: 0.9,
        maintainAspectRatio: true
    })

    const [error, setError] = useState<string | null>(null)

    // Use a ref to keep track of images for cleanup on unmount
    const imagesRef = useRef<ImageFile[]>([])

    // Update ref whenever images change
    useEffect(() => {
        imagesRef.current = images
    }, [images])

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            imagesRef.current.forEach((img) => {
                if (img.preview) URL.revokeObjectURL(img.preview)
                if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl)
            })
        }
    }, [])

    const loadImageInfo = async (file: File): Promise<ImageFile> => {
        // Special handling for HEIC
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                // Dynamically import heic2any only when needed
                const heic2any = (await import('heic2any')).default;
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                }) as Blob;

                // If it returns an array (multiple images), take the first one
                const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                const url = URL.createObjectURL(finalBlob);

                return new Promise((resolve, reject) => {
                    const img = document.createElement("img")
                    img.onload = () => {
                        resolve({
                            id: crypto.randomUUID(),
                            file: file, // Keep original file ref
                            name: file.name,
                            size: file.size,
                            preview: url,
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            status: 'idle'
                        })
                    }
                    img.onerror = () => {
                        URL.revokeObjectURL(url)
                        reject(new Error("Failed to load converted HEIC image"))
                    }
                    img.src = url
                });

            } catch (err) {
                console.error("HEIC conversion failed", err);
                throw new Error("Failed to process HEIC image: " + (err as Error).message);
            }
        }

        // Standard image loading
        return new Promise((resolve, reject) => {
            const img = document.createElement("img")
            const url = URL.createObjectURL(file)

            img.onload = () => {
                resolve({
                    id: crypto.randomUUID(),
                    file,
                    name: file.name,
                    size: file.size,
                    preview: url,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    status: 'idle'
                })
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error(`Failed to load image: ${file.name}`))
            }

            img.src = url
        })
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null)
        const validImages: ImageFile[] = []
        const failedFiles: string[] = []

        for (const file of acceptedFiles) {
            try {
                const imageInfo = await loadImageInfo(file)
                validImages.push(imageInfo)
            } catch (err) {
                console.warn(`Failed to load image: ${file.name}`, err)
                failedFiles.push(file.name)
            }
        }

        if (failedFiles.length > 0) {
            setError(`Failed to load: ${failedFiles.join(", ")}`)
        }

        if (validImages.length > 0) {
            setImages((prev) => [...prev, ...validImages])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".ico", ".svg", ".tiff", ".tif", ".avif", ".heic", ".heif"],
        },
        noClick: images.length > 0,
        noKeyboard: true
    })

    const removeImage = (id: string) => {
        setImages((prev) => {
            const newImages = prev.filter((img) => img.id !== id)
            const removed = prev.find(img => img.id === id)
            if (removed) {
                if (removed.preview) URL.revokeObjectURL(removed.preview)
                if (removed.convertedUrl) URL.revokeObjectURL(removed.convertedUrl)
            }
            return newImages
        })
    }

    const handleReset = () => {
        images.forEach(img => {
            if (img.preview) URL.revokeObjectURL(img.preview)
            if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl)
        });
        setImages([]);
        setOptions({
            targetFormat: "jpeg",
            quality: 0.9,
            maintainAspectRatio: true
        });
        setError(null);
    }

    const convertImage = async (image: ImageFile): Promise<{ blob: Blob, extension: string }> => {
        // Dynamically import conversion utils to keep initial bundle small
        const { convertToBmp, convertToIco, convertToTiff, convertToGif, convertToSvg } = await import('@/features/image-converter/utils/conversion-utils');

        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                ctx.drawImage(img, 0, 0);

                let mimeType = "image/jpeg";
                let extension = "jpg";
                let blob: Blob | null = null;

                try {
                    switch (options.targetFormat) {
                        case "jpeg":
                            mimeType = "image/jpeg";
                            extension = "jpg";
                            // Standard canvas conversion
                            canvas.toBlob((b) => {
                                if (b) resolve({ blob: b, extension });
                                else reject(new Error("Conversion failed"));
                            }, mimeType, options.quality);
                            return;
                        case "png":
                            mimeType = "image/png";
                            extension = "png";
                            // Standard canvas conversion
                            canvas.toBlob((b) => {
                                if (b) resolve({ blob: b, extension });
                                else reject(new Error("Conversion failed"));
                            }, mimeType);
                            return;
                        case "webp":
                            mimeType = "image/webp";
                            extension = "webp";
                            // Standard canvas conversion
                            canvas.toBlob((b) => {
                                if (b) resolve({ blob: b, extension });
                                else reject(new Error("Conversion failed"));
                            }, mimeType, options.quality);
                            return;
                        case "bmp":
                            blob = await convertToBmp(ctx.getImageData(0, 0, canvas.width, canvas.height));
                            extension = "bmp";
                            resolve({ blob, extension });
                            return;
                        case "ico":
                            blob = await convertToIco(canvas);
                            extension = "ico";
                            resolve({ blob, extension });
                            return;
                        case "svg":
                            // Use imagetracerjs for true vectorization
                            {
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                                // Map quality (0.1 - 1.0) to color count (8 - 128)
                                const colorCount = Math.max(8, Math.ceil(options.quality * 128));

                                const tracingOptions: Record<string, unknown> = {
                                    // Tracing - smooth curves
                                    ltres: 1,
                                    qtres: 1,
                                    pathomit: 0, // Do NOT remove any paths — prevents white spots/gaps in solid areas
                                    rightangleenhance: true,

                                    // Color quantization
                                    numberofcolors: colorCount,
                                    colorsampling: 2, // Deterministic sampling
                                    mincolorratio: 0,
                                    colorquantcycles: 6, // More cycles = better color convergence, fewer stray colors

                                    // SVG rendering
                                    scale: 1,
                                    roundcoords: 2,
                                    viewbox: true,
                                    desc: false,
                                    lcpr: 0,
                                    qcpr: 0,

                                    // Blur preprocessing — slight blur helps merge anti-aliased edge pixels
                                    blurradius: 1,
                                    blurdelta: 20
                                };

                                blob = await convertToSvg(imageData, tracingOptions);
                            }
                            extension = "svg";
                            resolve({ blob, extension });
                            return;
                        case "gif":
                            // Use gif.js
                            blob = await convertToGif(canvas, options.quality);
                            extension = "gif";
                            resolve({ blob, extension });
                            return;
                        case "tiff":
                            // Use UTIF
                            blob = await convertToTiff(ctx.getImageData(0, 0, canvas.width, canvas.height));
                            extension = "tiff";
                            resolve({ blob, extension });
                            return;
                        case "avif":
                            mimeType = "image/avif";
                            extension = "avif";
                            // Standard canvas conversion
                            canvas.toBlob((b) => {
                                if (b) resolve({ blob: b, extension });
                                else reject(new Error("Conversion failed"));
                            }, mimeType, options.quality);
                            return;
                        case "heic":
                            // Fallback or error since we can't write HEIC easily
                            reject(new Error("HEIC output conversion is not supported in this browser version."));
                            return;
                    }

                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image for conversion"));
            img.src = image.preview;
        });
    }

    const processConversion = async () => {
        if (images.length === 0) return
        setIsProcessing(true)
        setError(null)

        try {
            if (images.length === 1) {
                const { blob, extension } = await convertImage(images[0]);
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a")
                link.href = url
                link.download = `${images[0].name.replace(/\.[^/.]+$/, "")}.${extension}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            } else {
                // Batch conversion
                const zip = new JSZip()

                await Promise.all(images.map(async (image) => {
                    try {
                        const { blob, extension } = await convertImage(image);
                        const fileName = `${image.name.replace(/\.[^/.]+$/, "")}.${extension}`;
                        zip.file(fileName, blob);
                    } catch (e) {
                        console.error(`Failed to convert ${image.name}`, e);
                    }
                }));

                const content = await zip.generateAsync({ type: "blob" })
                const url = URL.createObjectURL(content)
                const link = document.createElement("a")
                link.href = url
                link.download = "converted_images.zip"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            }

        } catch (err) {
            console.error("Conversion failed:", err)
            setError("Failed to convert images. Please check if all files are valid.")
        } finally {
            setIsProcessing(false)
        }
    }

    if (images.length === 0) {
        return (
            <div className="py-12">
                <ImageUploader
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    description="Support JPG, PNG, WebP, GIF, BMP, ICO, SVG, HEIC, AVIF, TIFF"
                />

                {/* Features Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 text-center">
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7l5-5-5-5v5z" /><path d="M3 7v5l-5 5 5 5v-5z" /><path d="M12 21a9 9 0 0 0 0-18 9 9 0 0 0 0 18z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Universal Format Support</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Convert between JPG, PNG, WebP, BMP, and ICO formats instantly. Support for HEIC, SVG, TIFF reading.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <Plus className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Batch Processing</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Upload multiple images and convert them all at once. Download as a single ZIP file.
                        </p>
                    </div>
                    <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Secure & Private</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            All conversions happen locally in your browser. Your photos never leave your device.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Preview Grid */}
            <div className="space-y-4 lg:col-span-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Preview & Reorder
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={openFileDialog} className="cursor-pointer">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Images
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </div>

                <ImageGrid
                    images={images}
                    onReorder={setImages}
                    onRemove={removeImage}
                />

                <p className="text-sm text-center text-gray-400 mt-2">
                    Drag and drop images to reorder.
                </p>

                <input {...getInputProps()} className="hidden" />
            </div>

            {/* Right: Settings Panel */}
            <ImageSettings
                options={options}
                onOptionsChange={setOptions}
                onReset={handleReset}
                onConvert={processConversion}
                isProcessing={isProcessing}
                hasImages={images.length > 0}
            />

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-lg shadow-lg border border-red-200 z-50 animate-in slide-in-from-bottom-5">
                    {error}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0 rounded-full hover:bg-red-100"
                        onClick={() => setError(null)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    )
}
