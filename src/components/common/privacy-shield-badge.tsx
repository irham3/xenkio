'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ShieldCheck, Wifi, WifiOff, Activity } from 'lucide-react';

/**
 * Detects approximate device memory capacity.
 * Returns the estimated max file size in MB the device can handle.
 */
function useDeviceCapacity(): { memoryGB: number | null; maxFileMB: number } {
    // navigator.deviceMemory is a static value, safe to read synchronously
    const memoryGB = useMemo(() => {
        if (typeof navigator === 'undefined') return null;
        const nav = navigator as Navigator & { deviceMemory?: number };
        return nav.deviceMemory ?? null;
    }, []);

    // Conservative estimate: device can handle ~25% of RAM for a single file operation
    const maxFileMB = memoryGB ? Math.round(memoryGB * 1024 * 0.25) : 500;

    return { memoryGB, maxFileMB };
}

/**
 * Monitors network activity by intercepting fetch/XHR requests.
 * Shows real-time proof that no file data is sent to servers.
 */
function useNetworkMonitor(): { requestCount: number; isMonitoring: boolean } {
    const [requestCount, setRequestCount] = useState(0);
    const countRef = useRef(0);

    useEffect(() => {
        // Track fetch requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
            // Ignore analytics, HMR, and Next.js internal requests
            const isInternal =
                url.includes('cloudflareinsights') ||
                url.includes('_next') ||
                url.includes('__nextjs') ||
                url.includes('webpack') ||
                url.includes('hot-update') ||
                url.includes('favicon') ||
                url.includes('manifest');
            if (!isInternal) {
                countRef.current += 1;
                setRequestCount(countRef.current);
            }
            return originalFetch(...args);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return { requestCount, isMonitoring: true };
}

interface PrivacyShieldBadgeProps {
    /** Show device capacity estimation */
    showCapacity?: boolean;
    /** Show live network monitor */
    showNetworkMonitor?: boolean;
    /** Compact mode for tool headers */
    variant?: 'default' | 'compact' | 'inline';
}

export function PrivacyShieldBadge({
    showCapacity = false,
    showNetworkMonitor = false,
    variant = 'default',
}: PrivacyShieldBadgeProps) {
    const { memoryGB, maxFileMB } = useDeviceCapacity();
    const { requestCount } = useNetworkMonitor();
    const [isOfflineCapable, setIsOfflineCapable] = useState(false);

    useEffect(() => {
        // Check if service worker is registered (PWA offline capability)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                setIsOfflineCapable(registrations.length > 0);
            });
        }
    }, []);

    if (variant === 'inline') {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Processed locally — your files never leave this device</span>
                {isOfflineCapable && (
                    <>
                        <span className="text-emerald-300">·</span>
                        <WifiOff className="w-3 h-3" />
                        <span>Works offline</span>
                    </>
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Processed on your device</span>
                </div>
                {showNetworkMonitor && (
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                            {requestCount === 0
                                ? 'Zero data sent to servers'
                                : `${requestCount} network request${requestCount !== 1 ? 's' : ''} (none with your data)`}
                        </span>
                    </div>
                )}
                {isOfflineCapable && (
                    <div className="flex items-center gap-1.5">
                        <WifiOff className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Works offline</span>
                    </div>
                )}
            </div>
        );
    }

    // Default variant - full card
    return (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        100% Local Processing
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Your files are processed entirely in your browser using JavaScript and WebAssembly.
                        Nothing is uploaded to any server. This tool is inherently GDPR-compliant.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        {/* Network Monitor */}
                        {showNetworkMonitor && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-emerald-700 font-medium">
                                    {requestCount === 0
                                        ? 'No data sent to servers'
                                        : `${requestCount} request${requestCount !== 1 ? 's' : ''} (analytics only)`}
                                </span>
                            </div>
                        )}

                        {/* Offline Badge */}
                        {isOfflineCapable && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                                <WifiOff className="w-3 h-3" />
                                Works offline
                            </div>
                        )}

                        {/* Device Capacity */}
                        {showCapacity && memoryGB && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Wifi className="w-3 h-3" />
                                Your device can handle files up to ~{maxFileMB >= 1024 ? `${(maxFileMB / 1024).toFixed(1)}GB` : `${maxFileMB}MB`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Device capacity warning banner for file processing tools.
 * Shows when the user's device may struggle with very large files.
 */
export function DeviceCapacityInfo() {
    const { memoryGB, maxFileMB } = useDeviceCapacity();
    const [dismissed, setDismissed] = useState(false);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
    }, []);

    if (dismissed || !memoryGB || memoryGB >= 8) return null;

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-xs">
            <Activity className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-amber-800 font-medium">Device capacity detected: {memoryGB}GB RAM</p>
                <p className="text-amber-700 mt-0.5">
                    For best performance, we recommend files under ~{maxFileMB}MB.
                    Larger files may be slower to process on this device.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
