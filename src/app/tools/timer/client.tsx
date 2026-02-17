'use client';


import {
    useTimer,
    TimerDisplay,
    TimerControls,
    TimerSettings,
    TimerPresets
} from '@/features/timer';
import { Bell, BellOff, Info } from 'lucide-react';

export function TimerClient() {
    const {
        config,
        state,
        start,
        pause,
        resume,
        stop,
        reset,
        updateConfig
    } = useTimer();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Settings & Presets */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">1</span>
                            Configure
                        </h2>
                        <button
                            onClick={() => updateConfig({ soundEnabled: !config.soundEnabled })}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-primary-600"
                            title={config.soundEnabled ? "Disable Alarm" : "Enable Alarm"}
                        >
                            {config.soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                    </div>

                    <TimerSettings config={config} onChange={updateConfig} />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm">2</span>
                        Quick Presets
                    </h2>
                    <TimerPresets
                        onSelect={(seconds) => updateConfig({ duration: seconds, mode: 'countdown' })}
                        currentDuration={config.mode === 'countdown' ? config.duration : 0}
                    />
                </div>

                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-primary-500 shrink-0" />
                        <p className="text-sm text-primary-700 leading-relaxed">
                            <strong>Tip:</strong> You can set a target &quot;Target Time&quot; to end your work or meeting.
                            The timer will automatically calculate how much time you have left.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Main Timer Display */}
            <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative overflow-hidden">
                    {/* Subtle Background Pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        {config.mode === 'countdown' ? (
                            <span className="text-9xl font-bold font-mono">COUNT</span>
                        ) : (
                            <span className="text-9xl font-bold font-mono">TARGET</span>
                        )}
                    </div>

                    <div className="relative z-10">
                        {config.label && (
                            <div className="text-center mb-4">
                                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold tracking-wide uppercase">
                                    {config.label}
                                </span>
                            </div>
                        )}

                        <TimerDisplay
                            remainingTime={state.remainingTime}
                            initialDuration={state.initialDuration}
                            isPaused={state.isPaused}
                        />

                        <TimerControls
                            isActive={state.isActive}
                            isPaused={state.isPaused}
                            remainingTime={state.remainingTime}
                            onStart={start}
                            onPause={pause}
                            onResume={resume}
                            onReset={reset}
                            onStop={stop}
                        />
                    </div>
                </div>

                {/* Motivation Quote / Info */}
                <div className="mt-8 text-center text-gray-500 max-w-lg mx-auto">
                    <p className="italic">&quot;Time is what we want most, but what we use worst.&quot;</p>
                    <p className="text-xs mt-2 uppercase font-medium tracking-widest">— William Penn</p>
                </div>
            </div>
        </div>
    );
}
