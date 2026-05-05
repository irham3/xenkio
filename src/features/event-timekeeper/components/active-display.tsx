'use client';

import { cn } from '@/lib/utils';
import { ScheduleEvent } from '../types';
import { Play, Pause, SkipForward, SkipBack, Square, Clock } from '@phosphor-icons/react/dist/ssr';
import { useState, useEffect } from 'react';

interface ActiveDisplayProps {
    activeEvent: ScheduleEvent | null;
    nextEvent: ScheduleEvent | null;
    remainingSeconds: number;
    isRunning: boolean;
    isPaused: boolean;
    warningThreshold: number;
    criticalThreshold: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

function formatCountdown(seconds: number): { h: string; m: string; s: string } {
    const abs = Math.abs(seconds);
    return {
        h: String(Math.floor(abs / 3600)).padStart(2, '0'),
        m: String(Math.floor((abs % 3600) / 60)).padStart(2, '0'),
        s: String(abs % 60).padStart(2, '0'),
    };
}

function getTimerColor(remainingSeconds: number, warningMin: number, criticalMin: number): string {
    if (remainingSeconds <= 0) return 'text-red-500';
    if (remainingSeconds <= criticalMin * 60) return 'text-red-500';
    if (remainingSeconds <= warningMin * 60) return 'text-amber-500';
    return 'text-emerald-600';
}

function getTimerBg(remainingSeconds: number, warningMin: number, criticalMin: number): string {
    if (remainingSeconds <= 0) return 'bg-red-50 border-red-200';
    if (remainingSeconds <= criticalMin * 60) return 'bg-red-50 border-red-200';
    if (remainingSeconds <= warningMin * 60) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
}

function useWallClock(): string {
    const [time, setTime] = useState('--:--:--');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return time;
}

export function ActiveDisplay({
    activeEvent,
    nextEvent,
    remainingSeconds,
    isRunning,
    isPaused,
    warningThreshold,
    criticalThreshold,
    onStart,
    onPause,
    onResume,
    onStop,
    onNext,
    onPrevious,
}: ActiveDisplayProps) {
    const wallClock = useWallClock();
    const time = formatCountdown(remainingSeconds);
    const isOvertime = activeEvent ? activeEvent.elapsedSeconds > activeEvent.durationMinutes * 60 : false;
    const overtimeSeconds = activeEvent ? activeEvent.elapsedSeconds - activeEvent.durationMinutes * 60 : 0;
    const overtimeTime = formatCountdown(overtimeSeconds);

    // Progress percentage
    const totalDuration = activeEvent ? activeEvent.durationMinutes * 60 : 1;
    const progress = activeEvent ? Math.min(100, (activeEvent.elapsedSeconds / totalDuration) * 100) : 0;

    // Delay info
    const delayMin = activeEvent?.delayMinutes ?? 0;

    return (
        <div className={cn(
            "rounded-2xl border p-6 md:p-8 shadow-sm transition-colors duration-500 relative",
            activeEvent ? getTimerBg(remainingSeconds, warningThreshold, criticalThreshold) : "bg-white border-gray-200"
        )}>
            {/* Wall Clock — always visible top-right */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5"  weight="duotone"/>
                <span className="text-sm font-mono">{wallClock}</span>
            </div>

            {/* Delay Badge — prominent if delayed */}
            {isRunning && delayMin > 0 && (
                <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-600 animate-pulse">
                        +{delayMin}m late
                    </span>
                </div>
            )}
            {isRunning && delayMin < 0 && (
                <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-600">
                        {delayMin}m ahead
                    </span>
                </div>
            )}

            {/* Current Event Info */}
            {activeEvent ? (
                <div className="text-center mb-2 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Now Playing</p>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{activeEvent.title}</h2>
                    {activeEvent.presenter && activeEvent.presenter !== '-' && (
                        <p className="text-sm text-gray-500">{activeEvent.presenter}</p>
                    )}
                    {/* Show actual time vs planned */}
                    {delayMin !== 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                            Planned {activeEvent.startTime}–{activeEvent.endTime}
                            {' → '}Actual {activeEvent.actualStartTime}–{activeEvent.actualEndTime}
                        </p>
                    )}
                </div>
            ) : (
                <div className="text-center mb-2 pt-4">
                    <p className="text-lg text-gray-400">No event in progress</p>
                    <p className="text-sm text-gray-300 mt-1">Press START to begin the schedule</p>
                </div>
            )}

            {/* Big Timer */}
            <div className="flex flex-col items-center justify-center py-6 md:py-10">
                {isOvertime ? (
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 animate-pulse">⚠ Overtime</p>
                        <div className="text-6xl md:text-8xl font-mono font-bold text-red-500 tracking-tighter animate-pulse">
                            +{overtimeTime.h !== '00' && <span>{overtimeTime.h}:</span>}
                            <span>{overtimeTime.m}</span>:<span>{overtimeTime.s}</span>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "text-6xl md:text-8xl font-mono font-bold tracking-tighter transition-colors duration-500",
                        activeEvent ? getTimerColor(remainingSeconds, warningThreshold, criticalThreshold) : "text-gray-300",
                        isPaused && "opacity-60"
                    )}>
                        {time.h !== '00' && <span>{time.h}:</span>}
                        <span>{time.m}</span>:<span>{time.s}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {activeEvent && (
                    <div className="w-full max-w-md mt-6">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-linear",
                                    isOvertime ? "bg-red-400" :
                                        remainingSeconds <= criticalThreshold * 60 ? "bg-red-400" :
                                            remainingSeconds <= warningThreshold * 60 ? "bg-amber-400" :
                                                "bg-emerald-400"
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{activeEvent.actualStartTime}</span>
                            <span>{activeEvent.durationMinutes}m</span>
                            <span>{activeEvent.actualEndTime}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls — BIG buttons for hectic organizers */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                {!isRunning ? (
                    <button
                        onClick={onStart}
                        className="flex items-center gap-2 px-10 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-lg transition-all transform active:scale-95 shadow-lg"
                    >
                        <Play className="w-6 h-6 fill-current"  weight="duotone"/>
                        START
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onPrevious}
                            className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                            title="Previous Session"
                        >
                            <SkipBack className="w-6 h-6"  weight="duotone"/>
                        </button>

                        {isPaused ? (
                            <button
                                onClick={onResume}
                                className="flex items-center gap-2 px-10 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-lg transition-all transform active:scale-95 shadow-lg"
                            >
                                <Play className="w-6 h-6 fill-current"  weight="duotone"/>
                                RESUME
                            </button>
                        ) : (
                            <button
                                onClick={onPause}
                                className="flex items-center gap-2 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-600 font-bold text-white text-lg transition-all transform active:scale-95 shadow-lg"
                            >
                                <Pause className="w-6 h-6 fill-current"  weight="duotone"/>
                                PAUSE
                            </button>
                        )}

                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-lg transition-colors"
                            title="Next Session"
                        >
                            NEXT
                            <SkipForward className="w-6 h-6"  weight="duotone"/>
                        </button>

                        <button
                            onClick={onStop}
                            className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                            title="Stop All"
                        >
                            <Square className="w-6 h-6 fill-current"  weight="duotone"/>
                        </button>
                    </>
                )}
            </div>

            {/* Next Up — glanceable */}
            {nextEvent && isRunning && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <SkipForward className="w-3.5 h-3.5"  weight="duotone"/>
                        <span>Next: <strong className="text-gray-600">{nextEvent.title}</strong></span>
                        {nextEvent.presenter && nextEvent.presenter !== '-' && (
                            <span className="text-gray-300">— {nextEvent.presenter}</span>
                        )}
                        <span className="text-gray-300">({nextEvent.durationMinutes}m)</span>
                    </div>
                </div>
            )}
        </div>
    );
}
