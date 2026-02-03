import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ZoomIn } from 'lucide-react';
import { PagePreview } from '../types';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import { ImageViewer } from '@/components/shared/image-viewer';

interface ImagePreviewGridProps {
    images: PagePreview[];
}

export function ImagePreviewGrid({ images }: ImagePreviewGridProps) {
    const [selectedImage, setSelectedImage] = useState<PagePreview | null>(null);

    const handleDownloadSingle = (image: PagePreview) => {
        saveAs(image.blob, `page-${image.pageNumber}.jpg`);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {images.map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.imageUrl}
                            alt={`Page ${image.pageNumber}`}
                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Page Badge */}
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Page {image.pageNumber}
                        </div>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full w-10 h-10 bg-white/90 hover:bg-white text-gray-900"
                                onClick={() => setSelectedImage(image)}
                                title="View Full Size"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                className="rounded-full w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white border-none"
                                onClick={() => handleDownloadSingle(image)}
                                title="Download Image"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ImageViewer
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                src={selectedImage?.imageUrl || ''}
                alt={selectedImage ? `Page ${selectedImage.pageNumber}` : ''}
                title={selectedImage ? `Page ${selectedImage.pageNumber}` : undefined}
                onDownload={selectedImage ? () => handleDownloadSingle(selectedImage) : undefined}
            />
        </>
    );
}
