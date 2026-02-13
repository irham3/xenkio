
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import jsQR from "jsqr"
import { CameraOff, RefreshCw, X, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QrScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'denied' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const requestRef = useRef<number | null>(null);
    const scanRef = useRef<() => void>(() => { });

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        setStatus('loading');
        setErrorMessage(null);

        try {
            if (typeof window === 'undefined') return;

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API is not supported in this browser or context (requires HTTPS).");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play().catch(e => console.error("Video play error:", e));
                        setStatus('active');
                    }
                };
            }
        } catch (err: unknown) {
            console.error("Camera access error:", err);
            const error = err as Error;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setStatus('denied');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setStatus('error');
                setErrorMessage("No camera found on this device.");
            } else {
                setStatus('error');
                setErrorMessage(error.message || "An unexpected error occurred while accessing the camera.");
            }
        }
    }, []);

    const handleRequestPermission = useCallback(() => {
        startCamera();
    }, [startCamera]);

    const scan = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
            const context = canvas.getContext("2d", { willReadFrequently: true });

            if (context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    onScan(code.data);
                    return;
                }
            }
        }
        requestRef.current = requestAnimationFrame(scanRef.current);
    }, [onScan]);

    useEffect(() => {
        scanRef.current = scan;
    }, [scan]);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) await startCamera();
        };
        init();
        return () => {
            isMounted = false;
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    useEffect(() => {
        if (status === 'active') {
            requestRef.current = requestAnimationFrame(scanRef.current);
        }
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };
    }, [status]);

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-square overflow-hidden rounded-3xl bg-black shadow-2xl group">
            {status === 'denied' || status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 text-white z-20 bg-gray-950">
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-in zoom-in-95 duration-500">
                        <CameraOff className="w-10 h-10 text-red-500" />
                    </div>

                    <div className="space-y-2 max-w-xs">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            {status === 'denied' ? "Camera Access Blocked" : "Connection Error"}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {status === 'denied'
                                ? "We need your permission to use the camera. Please click 'Allow' when the browser asks, or reset permissions in your site settings."
                                : errorMessage}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-[240px] pt-2">
                        <Button
                            onClick={handleRequestPermission}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-2xl h-12 font-semibold shadow-lg shadow-primary-900/20 transition-all cursor-pointer"
                        >
                            <Settings2 className="w-4 h-4 mr-2" />
                            Request Permission
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl h-10 cursor-pointer"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Close Scanner
                        </Button>
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-[10px] text-gray-600 font-medium uppercase tracking-widest px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 block"></span>
                        Requires HTTPS for Camera Access
                    </div>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className={cn(
                            "w-full h-full object-cover transition-opacity duration-1000",
                            status === 'active' ? "opacity-100" : "opacity-0"
                        )}
                        playsInline
                        autoPlay
                        muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {status === 'active' && (
                        <div className="absolute inset-0 pointer-events-none z-10 animate-in fade-in duration-1000">
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <div className="absolute w-full h-1 bg-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-scan-line z-20" />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                                <div className="absolute inset-0 bg-primary-500/5 animate-pulse" />
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-30">
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all border border-white/10 cursor-pointer active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 transition-colors duration-500">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                                    <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-500" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-white font-bold text-lg tracking-tight">Initializing Camera</p>
                                    <p className="text-gray-500 text-xs uppercase tracking-widest font-bold animate-pulse">Waiting for Permission</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
