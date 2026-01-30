import React from 'react';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
    isActive: boolean;
    isPaused: boolean;
    remainingTime: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onStop: () => void;
}

export function TimerControls({
    isActive,
    isPaused,
    remainingTime,
    onStart,
    onPause,
    onResume,
    onReset,
    onStop,
}: TimerControlsProps) {
    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            {!isActive ? (
                <button
                    onClick={onStart}
                    disabled={remainingTime === 0}
                    className={cn(
                        "flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all transform active:scale-95",
                        remainingTime === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700 shadow-primary"
                    )}
                >
                    <Play className="w-5 h-5 fill-current" />
                    START
                </button>
            ) : (
                <>
                    {isPaused ? (
                        <button
                            onClick={onResume}
                            className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 font-bold text-white transition-all transform active:scale-95 shadow-primary"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            RESUME
                        </button>
                    ) : (
                        <button
                            onClick={onPause}
                            className="flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-600 font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-amber-200"
                        >
                            <Pause className="w-5 h-5 fill-current" />
                            PAUSE
                        </button>
                    )}
                    <button
                        onClick={onStop}
                        className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Stop Timer"
                    >
                        <Square className="w-6 h-6 fill-current" />
                    </button>
                </>
            )}

            <button
                onClick={onReset}
                className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-colors"
                title="Reset Timer"
            >
                <RotateCcw className="w-6 h-6" />
            </button>
        </div>
    );
}
