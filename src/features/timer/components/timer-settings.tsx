import React, { useState, useEffect } from 'react';
import { TimerConfig, TimerMode } from '../types';
import { Clock, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerSettingsProps {
    config: TimerConfig;
    onChange: (config: Partial<TimerConfig>) => void;
}

export function TimerSettings({ config, onChange }: TimerSettingsProps) {
    const [h, setH] = useState(0);
    const [m, setM] = useState(5);
    const [s, setS] = useState(0);

    useEffect(() => {
        if (config.mode === 'countdown') {
            setH(Math.floor(config.duration / 3600));
            setM(Math.floor((config.duration % 3600) / 60));
            setS(config.duration % 60);
        }
    }, [config.duration, config.mode]);

    const handleTimeChange = (type: 'h' | 'm' | 's', val: number) => {
        const newH = type === 'h' ? val : h;
        const newM = type === 'm' ? val : m;
        const newS = type === 's' ? val : s;

        setH(newH);
        setM(newM);
        setS(newS);

        onChange({ duration: newH * 3600 + newM * 60 + newS });
    };

    return (
        <div className="space-y-6">
            <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => onChange({ mode: 'countdown' })}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                        config.mode === 'countdown' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    Countdown
                </button>
                <button
                    onClick={() => {
                        const now = new Date();
                        const nextTime = new Date(now.getTime() + 5 * 60 * 1000);
                        const defaultTime = `${String(nextTime.getHours()).padStart(2, '0')}:${String(nextTime.getMinutes()).padStart(2, '0')}`;
                        onChange({
                            mode: 'deadline',
                            deadline: config.deadline || defaultTime
                        });
                    }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                        config.mode === 'deadline' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Calendar className="w-4 h-4" />
                    By Target Time
                </button>
            </div>

            {config.mode === 'countdown' ? (
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</label>
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={String(h).padStart(2, '0')}
                            onChange={(e) => handleTimeChange('h', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-xl font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Minutes</label>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={String(m).padStart(2, '0')}
                            onChange={(e) => handleTimeChange('m', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-xl font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seconds</label>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={String(s).padStart(2, '0')}
                            onChange={(e) => handleTimeChange('s', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-xl font-mono"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Time (Today at...)</label>
                        <input
                            type="time"
                            value={config.deadline || ''}
                            onChange={(e) => onChange({ deadline: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-xl font-mono"
                        />
                    </div>
                    <p className="text-sm text-gray-400 italic">
                        Tip: The timer will automatically calculate the countdown until the chosen time.
                    </p>
                </div>
            )}

            <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timer Label (Optional)</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Go home, Meeting, Pizza..."
                        value={config.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                    <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>
        </div>
    );
}
