'use client';

import { ChevronLeft, ChevronRight, Video, VideoOff, Wifi } from 'lucide-react';
import type { GestureDirection } from '../types';

interface GestureOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    isModelLoading: boolean;
    gestureDirection: GestureDirection;
    error: string | null;
}

export function GestureOverlay({
    videoRef,
    isActive,
    isModelLoading,
    gestureDirection,
    error,
}: GestureOverlayProps) {
    if (!isActive && !isModelLoading) return null;

    return (
        <>
            {/* Hidden video element (must be in DOM for AI to work) */}
            <div className="fixed opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                />
            </div>

            {/* Subtle Status Indicator (Bottom right) */}
            {!error && (
                <div className="fixed bottom-24 right-6 z-50">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
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
                                    <div className="w-5 h-5 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Video className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Gesture Ready</span>
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
