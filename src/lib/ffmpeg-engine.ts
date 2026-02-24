// ============================================================
// FFmpeg Stable Engine Manager (v0.10.1)
// ============================================================
// Centralized manager to prevent race conditions and handle
// loading retries for FFmpeg.
// ============================================================

const FFMPEG_SOURCES = [
    {
        script: 'https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js',
        core: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    },
    {
        script: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js',
        core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    },
] as const;

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

async function injectScript(url: string, timeoutMs = 15000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('Window is undefined'));
        if (window.FFmpeg) return resolve();

        const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
        if (existing?.dataset.loaded === 'true') return resolve();

        const script = existing ?? document.createElement('script');
        script.src = url;
        script.async = true;

        const timeoutId = window.setTimeout(() => {
            reject(new Error(`Timed out while loading FFmpeg script: ${url}`));
        }, timeoutMs);

        script.onload = () => {
            window.clearTimeout(timeoutId);
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => {
            window.clearTimeout(timeoutId);
            reject(new Error(`Failed to load FFmpeg script from CDN: ${url}`));
        };

        if (!existing) {
            document.body.appendChild(script);
        }
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
        let lastError: Error | null = null;

        for (let i = 0; i <= retries; i++) {
            for (const source of FFMPEG_SOURCES) {
                try {
                    const cacheBust = i > 0 ? `?v=${Date.now()}` : '';
                    const scriptUrl = `${source.script}${cacheBust}`;
                    const coreUrl = `${source.core}${cacheBust}`;

                    await injectScript(scriptUrl);

                    if (!window.FFmpeg) {
                        throw new Error('FFmpeg global object not found after script injection');
                    }

                    const ffmpeg = window.FFmpeg.createFFmpeg({
                        corePath: coreUrl,
                        log: false,
                    });

                    await ffmpeg.load();
                    ffmpegInstance = ffmpeg;
                    return ffmpeg;
                } catch (err) {
                    const error = err instanceof Error ? err : new Error('Failed to load FFmpeg engine');
                    console.error(`FFmpeg load attempt ${i + 1} failed:`, err);
                    lastError = error;
                }
            }

            if (i < retries) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        loadPromise = null; // Reset so next call can try again
        throw lastError ?? new Error('Failed to initialize FFmpeg engine after retries');
    })();

    return loadPromise;
}

/**
 * Utility to fetch file for FFmpeg
 */
export async function ffmpegFetchFile(file: File | Blob | string): Promise<Uint8Array> {
    if (!window.FFmpeg) {
        let lastError: Error | null = null;
        for (const source of FFMPEG_SOURCES) {
            try {
                await injectScript(source.script);
                break;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error('Failed to load FFmpeg script');
            }
        }
        if (!window.FFmpeg && lastError) {
            throw lastError;
        }
    }
    return window.FFmpeg.fetchFile(file);
}
