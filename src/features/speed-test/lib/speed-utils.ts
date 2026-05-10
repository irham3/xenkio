/** Cloudflare Speed Test endpoints - CORS-enabled, no API key required */
const CF_BASE = 'https://speed.cloudflare.com';

/** Measure round-trip latency in milliseconds */
export async function measurePing(signal?: AbortSignal): Promise<number> {
    const url = `${CF_BASE}/__down?bytes=0&nocache=${Date.now()}`;
    const start = performance.now();
    const res = await fetch(url, {
        cache: 'no-store',
        mode: 'cors',
        signal,
    });
    assertOk(res, 'Latency check');
    return performance.now() - start;
}

/** Run N ping samples and return { avg, jitter } */
export async function measurePingStats(
    samples = 8,
    onProgress?: (done: number, total: number, latestMs: number) => void,
    signal?: AbortSignal,
): Promise<{ avg: number; jitter: number }> {
    const latencies: number[] = [];

    for (let i = 0; i < samples; i++) {
        throwIfAborted(signal);
        const ms = await measurePing(signal);
        latencies.push(ms);
        onProgress?.(i + 1, samples, ms);
        // Brief pause between samples so the browser doesn't batch them
        await sleep(80, signal);
    }

    const avg = average(latencies);
    const jitter = calculateJitter(latencies);
    return { avg: Math.round(avg), jitter: Math.round(jitter) };
}

/** Download `bytes` from Cloudflare and return elapsed ms */
export async function downloadChunk(bytes: number, signal?: AbortSignal): Promise<number> {
    const url = `${CF_BASE}/__down?bytes=${bytes}&nocache=${Date.now()}`;
    const start = performance.now();
    const res = await fetch(url, {
        cache: 'no-store',
        mode: 'cors',
        signal,
    });
    assertOk(res, 'Download test');
    // Drain the body so we measure full transfer
    await res.arrayBuffer();
    return performance.now() - start;
}

/** Run a multi-chunk download speed test and return Mbps */
export async function measureDownloadSpeed(
    onProgress?: (pct: number, currentMbps: number) => void,
    signal?: AbortSignal,
): Promise<number> {
    // Progressive sizes: warm-up small, then increase
    const chunks = [
        { bytes: 100_000, weight: 0.05 },
        { bytes: 1_000_000, weight: 0.15 },
        { bytes: 5_000_000, weight: 0.30 },
        { bytes: 10_000_000, weight: 0.25 },
        { bytes: 25_000_000, weight: 0.25 },
    ];

    const samples: number[] = [];
    let done = 0;

    for (const { bytes, weight } of chunks) {
        throwIfAborted(signal);
        const elapsed = await downloadChunk(bytes, signal);
        const mbps = bytesToMbps(bytes, elapsed);
        samples.push(mbps);
        done += weight;
        onProgress?.(Math.min(done * 100, 98), mbps);
        await sleep(50, signal);
    }

    onProgress?.(100, average(samples));
    return Math.round(trimmedMean(samples) * 100) / 100;
}

/** Upload `bytes` to Cloudflare and return elapsed ms */
export async function uploadChunk(bytes: number, signal?: AbortSignal): Promise<number> {
    const body = generatePayload(bytes);
    const url = `${CF_BASE}/__up?nocache=${Date.now()}`;
    const start = performance.now();
    // Keep this CORS-simple; application/octet-stream triggers a preflight
    // that Cloudflare's upload endpoint rejects.
    const res = await fetch(url, {
        method: 'POST',
        body,
        cache: 'no-store',
        mode: 'cors',
        signal,
    });
    assertOk(res, 'Upload test');
    return performance.now() - start;
}

/** Run a multi-chunk upload speed test and return Mbps */
export async function measureUploadSpeed(
    onProgress?: (pct: number, currentMbps: number) => void,
    signal?: AbortSignal,
): Promise<number> {
    const chunks = [
        { bytes: 100_000, weight: 0.05 },
        { bytes: 1_000_000, weight: 0.20 },
        { bytes: 5_000_000, weight: 0.35 },
        { bytes: 10_000_000, weight: 0.40 },
    ];

    const samples: number[] = [];
    let done = 0;

    for (const { bytes, weight } of chunks) {
        throwIfAborted(signal);
        const elapsed = await uploadChunk(bytes, signal);
        const mbps = bytesToMbps(bytes, elapsed);
        samples.push(mbps);
        done += weight;
        onProgress?.(Math.min(done * 100, 98), mbps);
        await sleep(50, signal);
    }

    onProgress?.(100, average(samples));
    return Math.round(trimmedMean(samples) * 100) / 100;
}

// Helpers

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    if (!signal) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    throwIfAborted(signal);

    return new Promise((resolve, reject) => {
        const timeout = globalThis.setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);

        const onAbort = () => {
            globalThis.clearTimeout(timeout);
            reject(signal.reason ?? new DOMException('The operation was aborted.', 'AbortError'));
        };

        signal.addEventListener('abort', onAbort, { once: true });
    });
}

function assertOk(res: Response, label: string): void {
    if (!res.ok) {
        throw new Error(`${label} failed with HTTP ${res.status}`);
    }
}

function throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    }
}

function average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Trim top/bottom 20 % outliers, then average */
function trimmedMean(values: number[]): number {
    if (values.length <= 2) return average(values);
    const sorted = [...values].sort((a, b) => a - b);
    const cut = Math.floor(sorted.length * 0.2);
    const trimmed = sorted.slice(cut, sorted.length - cut);
    return average(trimmed.length > 0 ? trimmed : sorted);
}

function calculateJitter(latencies: number[]): number {
    if (latencies.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < latencies.length; i++) {
        total += Math.abs(latencies[i] - latencies[i - 1]);
    }
    return total / (latencies.length - 1);
}

function bytesToMbps(bytes: number, elapsedMs: number): number {
    return (bytes * 8) / (elapsedMs / 1000) / 1_000_000;
}

/** Generate a random byte buffer of the given size */
function generatePayload(bytes: number): ArrayBuffer {
    const buffer = new Uint8Array(bytes);
    // Fill with pseudo-random data to prevent compression
    for (let i = 0; i < bytes; i += 256) {
        buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer.buffer;
}

/** Human-readable Mbps label */
export function formatSpeed(mbps: number | null): string {
    if (mbps === null) return '—';
    if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
    if (mbps >= 100) return `${Math.round(mbps)} Mbps`;
    return `${mbps.toFixed(1)} Mbps`;
}

/** Rating badge for a given speed in Mbps */
export function getSpeedRating(mbps: number | null): {
    label: string;
    color: string;
    bgColor: string;
} {
    if (mbps === null) return { label: '—', color: 'text-gray-400', bgColor: 'bg-gray-100' };
    if (mbps >= 500) return { label: 'Excellent', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (mbps >= 100) return { label: 'Very Good', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (mbps >= 25) return { label: 'Good', color: 'text-primary-600', bgColor: 'bg-primary-50' };
    if (mbps >= 10) return { label: 'Fair', color: 'text-accent-600', bgColor: 'bg-accent-50' };
    return { label: 'Slow', color: 'text-error-600', bgColor: 'bg-error-50' };
}

/** Rating badge for jitter in ms */
export function getJitterRating(ms: number | null): {
    label: string;
    color: string;
    bgColor: string;
} {
    if (ms === null) return { label: '—', color: 'text-gray-400', bgColor: 'bg-gray-100' };
    if (ms < 10) return { label: 'Stable', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (ms < 30) return { label: 'Moderate', color: 'text-accent-600', bgColor: 'bg-accent-50' };
    return { label: 'Unstable', color: 'text-error-600', bgColor: 'bg-error-50' };
}

/** Rating badge for ping in ms */
export function getPingRating(ms: number | null): {
    label: string;
    color: string;
    bgColor: string;
} {
    if (ms === null) return { label: '—', color: 'text-gray-400', bgColor: 'bg-gray-100' };
    if (ms < 20) return { label: 'Excellent', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (ms < 50) return { label: 'Good', color: 'text-success-600', bgColor: 'bg-success-50' };
    if (ms < 100) return { label: 'Fair', color: 'text-accent-600', bgColor: 'bg-accent-50' };
    return { label: 'High', color: 'text-error-600', bgColor: 'bg-error-50' };
}
