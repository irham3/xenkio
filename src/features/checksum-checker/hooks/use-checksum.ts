'use client';

import { useState, useCallback, useRef } from 'react';
import { ChecksumAlgorithm, ChecksumFileInfo, ChecksumResult, HashingMode } from '../types';
import { CHECKSUM_ALGORITHMS } from '../constants';
import { computeAllChecksums, computeAllChecksumsFast } from '../lib/checksum-utils';

interface UseChecksumReturn {
    file: File | null;
    fileInfo: ChecksumFileInfo | null;
    results: ChecksumResult[];
    isComputing: boolean;
    progress: number;
    mode: HashingMode;
    setMode: (mode: HashingMode) => void;
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
    const [mode, setModeState] = useState<HashingMode>('fast');
    const [expectedHash, setExpectedHash] = useState('');

    // Refs so callbacks always see the latest values without stale closures.
    const modeRef = useRef<HashingMode>('fast');
    const fileRef = useRef<File | null>(null);
    const isComputingRef = useRef(false);

    const compute = useCallback(async (f: File, m: HashingMode) => {
        if (isComputingRef.current) return;
        isComputingRef.current = true;

        setResults(CHECKSUM_ALGORITHMS.map((a) => ({
            algorithm: a.id,
            hash: '',
            verified: null,
            isLoading: true,
        })));
        setIsComputing(true);
        setProgress(0);

        try {
            const all =
                m === 'fast'
                    ? await computeAllChecksumsFast(f)
                    : await computeAllChecksums(f, (pct) => setProgress(pct));

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
            isComputingRef.current = false;
            setIsComputing(false);
        }
    }, []);

    const handleFile = useCallback(async (f: File) => {
        fileRef.current = f;
        setFile(f);
        setFileInfo({
            name: f.name,
            size: f.size,
            type: f.type || 'application/octet-stream',
            lastModified: f.lastModified,
        });
        setExpectedHash('');
        compute(f, modeRef.current);
    }, [compute]);

    const setMode = useCallback((newMode: HashingMode) => {
        modeRef.current = newMode;
        setModeState(newMode);
        if (fileRef.current && !isComputingRef.current) {
            compute(fileRef.current, newMode);
        }
    }, [compute]);

    const reset = useCallback(() => {
        fileRef.current = null;
        setFile(null);
        setFileInfo(null);
        setResults(buildInitialResults());
        isComputingRef.current = false;
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

    return { file, fileInfo, results, isComputing, progress, mode, setMode, expectedHash, setExpectedHash, handleFile, reset, verifyAgainst };
}
