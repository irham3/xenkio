'use client';

import { useState, useCallback } from 'react';
import { ChecksumAlgorithm, ChecksumFileInfo, ChecksumResult } from '../types';
import { CHECKSUM_ALGORITHMS } from '../constants';
import { computeAllChecksums } from '../lib/checksum-utils';

interface UseChecksumReturn {
    file: File | null;
    fileInfo: ChecksumFileInfo | null;
    results: ChecksumResult[];
    isComputing: boolean;
    progress: number;
    expectedHash: string;
    setExpectedHash: (v: string) => void;
    handleFile: (f: File) => void;
    reset: () => void;
    verifyAgainst: (hash: string, algorithm: ChecksumAlgorithm) => boolean | null;
}

function buildInitialResults(): ChecksumResult[] {
    return CHECKSUM_ALGORITHMS.map((a) => ({
        algorithm: a.id,
        hash: '',
        verified: null,
        isLoading: false,
    }));
}

export function useChecksum(): UseChecksumReturn {
    const [file, setFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<ChecksumFileInfo | null>(null);
    const [results, setResults] = useState<ChecksumResult[]>(buildInitialResults());
    const [isComputing, setIsComputing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [expectedHash, setExpectedHash] = useState('');

    const handleFile = useCallback(async (f: File) => {
        setFile(f);
        setFileInfo({
            name: f.name,
            size: f.size,
            type: f.type || 'application/octet-stream',
            lastModified: f.lastModified,
        });
        setExpectedHash('');
        setResults(CHECKSUM_ALGORITHMS.map((a) => ({
            algorithm: a.id,
            hash: '',
            verified: null,
            isLoading: true,
        })));
        setIsComputing(true);
        setProgress(0);

        try {
            const all = await computeAllChecksums(f, (pct) => setProgress(pct));
            setResults(CHECKSUM_ALGORITHMS.map((a) => ({
                algorithm: a.id,
                hash: all[a.id],
                verified: null,
                isLoading: false,
            })));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to compute checksum';
            setResults(CHECKSUM_ALGORITHMS.map((a) => ({
                algorithm: a.id,
                hash: '',
                verified: null,
                isLoading: false,
                error: message,
            })));
        } finally {
            setIsComputing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setFile(null);
        setFileInfo(null);
        setResults(buildInitialResults());
        setIsComputing(false);
        setProgress(0);
        setExpectedHash('');
    }, []);

    const verifyAgainst = useCallback(
        (hash: string, algorithm: ChecksumAlgorithm): boolean | null => {
            const result = results.find((r) => r.algorithm === algorithm);
            if (!result || !result.hash || !hash) return null;
            return result.hash.toLowerCase() === hash.toLowerCase().trim();
        },
        [results],
    );

    return { file, fileInfo, results, isComputing, progress, expectedHash, setExpectedHash, handleFile, reset, verifyAgainst };
}
