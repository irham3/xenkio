'use client';

import { cn } from '@/lib/utils';
import { ScheduleEvent } from '../types';
import { Minimize2, SkipForward, Pause, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FocusModeProps {
    activeEvent: ScheduleEvent | null;
    nextEvent: ScheduleEvent | null;
    remainingSeconds: number;
    isPaused: boolean;
    warningThreshold: number;
    criticalThreshold: number;
    onToggleFocus: () => void;
    onPause: () => void;
    onResume: () => void;
    onNext: () => void;
}

function formatTime(seconds: number): string {
    const abs = Math.abs(seconds);
    const h = Math.floor(abs / 3600);
    const m = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
    const s = String(abs % 60).padStart(2, '0');
    return h > 0 ? `${String(h).padStart(2, '0')}:${m}:${s}` : `${m}:${s}`;
}

export function FocusMode({
    activeEvent,
    nextEvent,
    remainingSeconds,
    isPaused,
    warningThreshold,
    criticalThreshold,
    onToggleFocus,
    onPause,
    onResume,
    onNext,
}: FocusModeProps) {
    const isOvertime = activeEvent ? activeEvent.elapsedSeconds > activeEvent.durationMinutes * 60 : false;
    const overtimeSeconds = activeEvent ? activeEvent.elapsedSeconds - activeEvent.durationMinutes * 60 : 0;

    const [wallClock, setWallClock] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setWallClock(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    const getColor = (): string => {
        if (isOvertime || remainingSeconds <= 0) return 'text-red-400';
        if (remainingSeconds <= criticalThreshold * 60) return 'text-red-400';
        if (remainingSeconds <= warningThreshold * 60) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center select-none">
            {/* Wall Clock Top Left */}
            <div className="absolute top-6 left-6 text-gray-600 font-mono text-xl">
                {wallClock}
            </div>

            {/* Exit Button */}
            <button
                onClick={onToggleFocus}
                className="absolute top-6 right-6 p-3 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                title="Exit Focus Mode"
            >
                <Minimize2 className="w-6 h-6" />
            </button>

            {/* Delay Info (Subtle) */}
            {activeEvent && activeEvent.delayMinutes !== 0 && (
                <div className="absolute top-20 left-6">
                    <span className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        activeEvent.delayMinutes > 0 ? "text-red-900/50" : "text-emerald-900/50"
                    )}>
                        Schedule: {activeEvent.delayMinutes > 0 ? `+${activeEvent.delayMinutes}m delay` : `${activeEvent.delayMinutes}m ahead`}
                    </span>
                </div>
            )}

            {/* Event Title */}
            {activeEvent && (
                <div className="text-center mb-6">
                    <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-2">Now</p>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{activeEvent.title}</h1>
                    {activeEvent.presenter && activeEvent.presenter !== '-' && (
                        <p className="text-lg text-gray-400">{activeEvent.presenter}</p>
                    )}
                </div>
            )}

            {/* Giant Timer */}
            <div className={cn(
                "text-[10rem] md:text-[14rem] font-mono font-bold leading-none tracking-tighter transition-colors duration-500",
                getColor(),
                isOvertime && "animate-pulse",
                isPaused && "opacity-40"
            )}>
                {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(remainingSeconds)}
            </div>

            {/* Minimal Controls */}
            <div className="mt-8 flex items-center gap-4">
                {isPaused ? (
                    <button
                        onClick={onResume}
                        className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <Play className="w-6 h-6 fill-current" />
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <Pause className="w-6 h-6 fill-current" />
                    </button>
                )}
                <button
                    onClick={onNext}
                    className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <SkipForward className="w-6 h-6" />
                </button>
            </div>

            {/* Next Up */}
            {nextEvent && (
                <div className="absolute bottom-8 text-center text-gray-500">
                    <p className="text-xs uppercase tracking-widest mb-1">Up Next</p>
                    <p className="text-lg text-gray-400">{nextEvent.title} ({nextEvent.durationMinutes}m)</p>
                </div>
            )}
        </div>
    );
}
