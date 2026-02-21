// ============================================================
// FFmpeg Stable Engine Manager (v0.10.1)
// ============================================================
// Centralized manager to prevent race conditions and handle
// loading retries for FFmpeg.
// ============================================================

const FFMPEG_SCRIPT_URL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js';
const FFMPEG_CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js';

export interface FFmpegInstance {
    load: () => Promise<void>;
    FS: (method: string, ...args: unknown[]) => unknown;
    run: (...args: string[]) => Promise<void>;
    setProgress: (callback: (p: { ratio: number }) => void) => void;
    exit: () => void;
}

declare global {
    interface Window {
        FFmpeg: {
            createFFmpeg: (options: Record<string, unknown>) => FFmpegInstance;
            fetchFile: (file: File | Blob | string) => Promise<Uint8Array>;
        };
    }
}

let loadPromise: Promise<FFmpegInstance> | null = null;
let ffmpegInstance: FFmpegInstance | null = null;

async function injectScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('Window is undefined'));
        if (window.FFmpeg) return resolve();

        const script = document.createElement('script');
        script.src = FFMPEG_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load FFmpeg script from CDN'));
        document.body.appendChild(script);
    });
}

/**
 * Initializes and returns the FFmpeg instance.
 * Uses a singleton pattern to ensure only one instance is created.
 */
export async function getFFmpeg(retries = 2): Promise<FFmpegInstance> {
    if (ffmpegInstance) return ffmpegInstance;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        let lastError: any = null;

        for (let i = 0; i <= retries; i++) {
            try {
                await injectScript();

                if (!window.FFmpeg) {
                    throw new Error('FFmpeg global object not found after script injection');
                }

                const ffmpeg = window.FFmpeg.createFFmpeg({
                    corePath: FFMPEG_CORE_URL,
                    log: false, // Set to false for production by default
                });

                await ffmpeg.load();
                ffmpegInstance = ffmpeg;
                return ffmpeg;
            } catch (err) {
                console.error(`FFmpeg load attempt ${i + 1} failed:`, err);
                lastError = err;
                // Wait before retry
                if (i < retries) await new Promise(r => setTimeout(r, 1000));
            }
        }

        loadPromise = null; // Reset so next call can try again
        throw lastError || new Error('Failed to initialize FFmpeg engine after retries');
    })();

    return loadPromise;
}

/**
 * Utility to fetch file for FFmpeg
 */
export async function ffmpegFetchFile(file: File | Blob | string): Promise<Uint8Array> {
    if (!window.FFmpeg) {
        await injectScript();
    }
    return window.FFmpeg.fetchFile(file);
}
