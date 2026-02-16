
import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { ZipFileEntry, ZipExtractorState } from '../types';

export function useZipExtractor() {
    const [state, setState] = useState<ZipExtractorState>({
        files: [],
        zipName: '',
        isExtracting: false,
        error: null,
    });

    const extractZip = useCallback(async (file: File) => {
        setState(prev => ({ ...prev, isExtracting: true, error: null, zipName: file.name }));

        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);

            const entries: ZipFileEntry[] = [];

            // Collect all entries first
            const promises = Object.keys(contents.files).map(async (filename) => {
                const zipFile = contents.files[filename];
                const isDirectory = zipFile.dir;

                let blob: Blob | undefined;
                if (!isDirectory) {
                    blob = await zipFile.async('blob');
                }

                const uncompressedSize = (zipFile as { _data?: { uncompressedSize: number } })._data?.uncompressedSize || 0;

                entries.push({
                    name: filename.split('/').pop() || filename,
                    path: filename,
                    size: uncompressedSize,
                    isDirectory,
                    blob
                });
            });

            await Promise.all(promises);

            setState(prev => ({
                ...prev,
                files: entries.sort((a, b) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.path.localeCompare(b.path);
                }),
                isExtracting: false
            }));
        } catch (err) {
            console.error('Zip extraction error:', err);
            setState(prev => ({
                ...prev,
                isExtracting: false,
                error: 'Failed to extract zip file. It might be corrupted or in an unsupported format.'
            }));
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            files: [],
            zipName: '',
            isExtracting: false,
            error: null,
        });
    }, []);

    const downloadFile = useCallback((entry: ZipFileEntry) => {
        if (entry.blob) {
            const url = URL.createObjectURL(entry.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = entry.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, []);

    return {
        ...state,
        extractZip,
        reset,
        downloadFile
    };
}
