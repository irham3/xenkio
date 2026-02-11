
import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FaviconFile, FaviconSettings, FaviconResult } from '../types';
import { FAVICON_SIZES, processIcon, createIco } from '../lib/icon-utils';

export function useFaviconGenerator() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<FaviconResult | null>(null);
    const [settings, setSettings] = useState<FaviconSettings>({
        borderRadius: 0,
        padding: 0,
        backgroundColor: 'transparent',
        includeApple: true,
        includeAndroid: true,
        includeMS: true,
    });

    const handleFileChange = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setResult(null);
    }, [previewUrl]);

    const generateFavicons = useCallback(async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const generatedFiles: FaviconFile[] = [];

            // Generate PNGs
            for (const item of FAVICON_SIZES) {
                const blob = await processIcon(img, item.size, settings);
                generatedFiles.push({
                    name: item.name,
                    blob,
                    width: item.size,
                    height: item.size,
                    type: 'png',
                });
            }

            // Generate ICO (32x32 based)
            const ico32 = generatedFiles.find(f => f.width === 32)?.blob;
            if (ico32) {
                const icoBlob = await createIco(ico32);
                generatedFiles.push({
                    name: 'favicon.ico',
                    blob: icoBlob,
                    width: 32,
                    height: 32,
                    type: 'ico',
                });
            }

            // Create ZIP
            const zip = new JSZip();
            generatedFiles.forEach(f => {
                zip.file(f.name, f.blob);
            });

            // Add instructions/manifests if needed
            if (settings.includeAndroid) {
                const manifest = {
                    name: "App Name",
                    short_name: "App",
                    icons: [
                        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
                        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
                    ],
                    theme_color: "#ffffff",
                    background_color: "#ffffff",
                    display: "standalone"
                };
                zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            setResult({
                files: generatedFiles,
                zipBlob,
            });

            URL.revokeObjectURL(img.src);
        } catch (error) {
            console.error('Favicon generation failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [file, settings]);

    const downloadZip = useCallback(() => {
        if (!result?.zipBlob) return;
        saveAs(result.zipBlob, 'favicons.zip');
    }, [result]);

    const reset = useCallback(() => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setResult(null);
    }, [previewUrl]);

    return {
        file,
        previewUrl,
        isProcessing,
        result,
        settings,
        setSettings,
        handleFileChange,
        generateFavicons,
        downloadZip,
        reset,
    };
}
