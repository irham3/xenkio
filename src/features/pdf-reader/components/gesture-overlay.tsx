'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, VideoOff, Wifi, Eye, EyeOff } from 'lucide-react';
import type { GestureDirection } from '../types';

interface GestureOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    isHandDetected: boolean;
    lowLightWarning: boolean;
    isModelLoading: boolean;
    gestureDirection: GestureDirection;
    error: string | null;
}

export function GestureOverlay({
    videoRef,
    isActive,
    isHandDetected,
    lowLightWarning,
    isModelLoading,
    gestureDirection,
    error,
}: GestureOverlayProps) {
    const [showCamera, setShowCamera] = useState(false);

    if (!isActive && !isModelLoading) return null;

    return (
        <>
            {/* Video element — visible when showCamera is true, hidden otherwise */}
            <div
                className={
                    showCamera && isActive && !error
                        ? 'fixed bottom-28 left-6 z-50 animate-in fade-in slide-in-from-left-4 duration-300'
                        : 'fixed opacity-0 pointer-events-none w-0 h-0 overflow-hidden'
                }
            >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 bg-black">
                    {/* Camera Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-48 h-36 object-cover rounded-2xl transform scale-x-[-1]"
                    />

                    {/* Hand Detection Overlay on Camera */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                        <div className={`
                            flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                            ${isHandDetected
                                ? 'bg-primary-500/80 text-white'
                                : 'bg-black/50 text-white/70'
                            }
                            backdrop-blur-sm transition-all duration-300
                        `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isHandDetected ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
                            {isHandDetected ? '✋ Detected' : 'No hand'}
                        </div>

                        {/* Hide camera button */}
                        <button
                            onClick={() => setShowCamera(false)}
                            className="p-1 rounded-lg bg-black/50 text-white/70 hover:bg-black/70 hover:text-white backdrop-blur-sm transition-colors"
                            aria-label="Hide camera"
                        >
                            <EyeOff className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Low light warning banner on camera */}
                    {lowLightWarning && !isHandDetected && (
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-amber-500/90 backdrop-blur-sm">
                            <p className="text-[9px] font-bold text-white text-center uppercase tracking-wider">
                                💡 Improve lighting for better detection
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Indicator (Bottom right) */}
            {!error && (
                <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
                    {/* Low Light Warning */}
                    {isActive && lowLightWarning && !isHandDetected && !showCamera && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Poor visibility? Check lighting</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
                        {isModelLoading ? (
                            <>
                                <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center animate-spin">
                                    <Wifi className="w-3 h-3 text-amber-600" />
                                </div>
                                <span className="text-xs font-semibold text-amber-800">Calibrating AI...</span>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors duration-300 ${isHandDetected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                                        <Video className={`w-3 h-3 transition-colors ${isHandDetected ? 'text-primary-600' : 'text-gray-400'}`} />
                                    </div>
                                    {isHandDetected && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary-500 border-2 border-white" />
                                    )}
                                </div>
                                <span className={`text-xs font-semibold transition-colors ${isHandDetected ? 'text-primary-900' : 'text-gray-500'}`}>
                                    {isHandDetected ? 'Hand Detected' : 'Gesture Ready'}
                                </span>

                                {/* Toggle camera preview button */}
                                <button
                                    onClick={() => setShowCamera(!showCamera)}
                                    className={`
                                        ml-1 p-1.5 rounded-lg transition-colors
                                        ${showCamera
                                            ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                        }
                                    `}
                                    aria-label={showCamera ? 'Hide camera preview' : 'Show camera preview'}
                                    title={showCamera ? 'Hide camera' : 'Show camera'}
                                >
                                    {showCamera ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-red-50 backdrop-blur-md rounded-2xl shadow-xl border border-red-100">
                        <VideoOff className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-semibold text-red-800">Camera Error</span>
                    </div>
                </div>
            )}

            {/* Fullscreen Swipe Feedback Card (mimics paper flip) */}
            {gestureDirection !== 'none' && (
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div
                            className={`
                                flex flex-col items-center gap-4 px-12 py-10 rounded-[40px]
                                bg-gray-900/90 backdrop-blur-xl text-white shadow-2xl
                                animate-in zoom-in-95 duration-200
                                ${gestureDirection === 'left' ? 'slide-in-from-right-20' : 'slide-in-from-left-20'}
                            `}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                {gestureDirection === 'left' ? (
                                    <ChevronRight className="w-10 h-10 animate-bounce-x" />
                                ) : (
                                    <ChevronLeft className="w-10 h-10 animate-bounce-x-reverse" />
                                )}
                            </div>
                            <span className="text-2xl font-bold tracking-tight">
                                {gestureDirection === 'left' ? 'Next Page' : 'Previous Page'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
