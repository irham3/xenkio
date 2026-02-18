
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UploadSignature({ onSave }: { onSave: (dataUrl: string) => void }) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            onSave(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [onSave]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        multiple: false,
    });

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer bg-gray-50",
                    isDragActive
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-primary-400 hover:bg-white hover:shadow-sm"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center transition-all",
                        isDragActive ? "bg-primary-100" : "bg-gray-100"
                    )}>
                        <ImageIcon className={cn(
                            "w-8 h-8 transition-colors",
                            isDragActive ? "text-primary-600" : "text-gray-400"
                        )} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                            {isDragActive ? "Drop your image here" : "Upload your signature"}
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG or JPEG supported.
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center italic">
                Tip: Use a transparent PNG for the best result on your PDF.
            </p>
        </div>
    );
}
