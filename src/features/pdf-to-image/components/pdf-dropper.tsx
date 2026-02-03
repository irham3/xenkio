import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PdfDropperProps {
    onFileSelect: (file: File) => void;
}

export function PdfDropper({ onFileSelect }: PdfDropperProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
        >
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer",
                    isDragActive
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-primary-400 hover:bg-gray-50 bg-white"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                        isDragActive ? "bg-primary-100" : "bg-gray-100"
                    )}>
                        <FileText className={cn(
                            "w-10 h-10 transition-colors",
                            isDragActive ? "text-primary-600" : "text-gray-400"
                        )} />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xl font-semibold text-gray-900">
                            {isDragActive ? "Drop your PDF here" : "Select PDF file"}
                        </p>
                        <p className="text-gray-500">
                            or drag and drop PDF file here
                        </p>
                    </div>

                    <Button size="lg" className="mt-4 rounded-xl h-12 px-8">
                        <Plus className="w-5 h-5 mr-2" />
                        Select PDF File
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
