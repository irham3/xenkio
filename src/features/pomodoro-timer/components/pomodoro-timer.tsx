'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePomodoro } from '../hooks/use-pomodoro';
import { TIMER_MODES } from '../constants';
import { cn } from '@/lib/utils';
import { TimerMode } from '../types';

export function PomodoroTimer() {
    const {
        mode,
        timeLeft,
        isActive,
        progress,
        settings,
        switchMode,
        toggleTimer,
        resetTimer,
        updateSettings,
    } = usePomodoro();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Update document title
    useEffect(() => {
        document.title = `${formatTime(timeLeft)} - ${TIMER_MODES[mode].label}`;
        return () => {
            document.title = 'Pomodoro Timer - Xenkio';
        };
    }, [timeLeft, mode]);

    const [showSettings, setShowSettings] = React.useState(false);

    // Dynamic color maps based on global theme
    const modeColors = {
        pomodoro: {
            text: 'text-primary-600',
            ring: 'text-primary-500',
            bg: 'bg-primary-50',
            button: 'bg-primary-600 hover:bg-primary-700 ring-primary-100',
            shadow: 'shadow-primary-lg'
        },
        shortBreak: {
            text: 'text-success-600',
            ring: 'text-success-500',
            bg: 'bg-success-50',
            button: 'bg-success-600 hover:bg-success-700 ring-success-100',
            shadow: 'shadow-xl'
        },
        longBreak: {
            text: 'text-accent-600',
            ring: 'text-accent-500',
            bg: 'bg-accent-50',
            button: 'bg-accent-600 hover:bg-accent-700 ring-accent-100',
            shadow: 'shadow-xl'
        }
    };

    const currentTheme = modeColors[mode];

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-8 md:gap-12">
            {/* Tabs */}
            <div className="w-full bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl ring-1 ring-gray-200/50 shadow-inner max-w-sm mx-auto">
                <Tabs
                    defaultValue="pomodoro"
                    value={mode}
                    onValueChange={(v) => switchMode(v as TimerMode)}
                    className="w-full"
                >
                    <TabsList className="w-full grid grid-cols-3 bg-transparent gap-1 p-0 h-auto">
                        <TabsTrigger
                            value="pomodoro"
                            className="py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm font-medium transition-all duration-300"
                        >
                            Pomodoro
                        </TabsTrigger>
                        <TabsTrigger
                            value="shortBreak"
                            className="py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-success-600 data-[state=active]:shadow-sm font-medium transition-all duration-300"
                        >
                            Short Break
                        </TabsTrigger>
                        <TabsTrigger
                            value="longBreak"
                            className="py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent-600 data-[state=active]:shadow-sm font-medium transition-all duration-300"
                        >
                            Long Break
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative flex flex-col items-center">
                {/* Circular Timer */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Track */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-100/50"
                        />
                        {/* Indicator */}
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeLinecap="round"
                            className={cn(
                                "transition-colors duration-500 drop-shadow-md",
                                currentTheme.ring
                            )}
                            key={mode}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 1, ease: "linear" }}
                            style={{
                                strokeDasharray: "283% 283%",
                            }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div
                            className="text-6xl md:text-7xl font-sans font-bold tracking-tight tabular-nums text-gray-900"
                        >
                            {formatTime(timeLeft)}
                        </div>
                        <p className={cn("mt-2 font-medium uppercase tracking-[0.2em] text-sm", isActive ? currentTheme.text : 'text-gray-400')}>
                            {isActive ? (mode === 'pomodoro' ? 'Focus' : 'Break') : 'Paused'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mt-8">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-14 w-14 rounded-2xl bg-gray-50 text-gray-500 hover:text-primary-600 hover:bg-white border border-gray-200 shadow-sm transition-all"
                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    >
                        {settings.soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6 text-gray-400" />}
                    </Button>

                    <Button
                        size="lg"
                        className={cn(
                            "h-24 w-24 rounded-3xl text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ring-4 ring-offset-2 ring-offset-white ring-transparent",
                            currentTheme.button,
                            currentTheme.shadow
                        )}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-14 w-14 rounded-2xl bg-gray-50 text-gray-500 hover:text-primary-600 hover:bg-white border border-gray-200 shadow-sm transition-all"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Settings */}
            <div className="w-full max-w-sm mx-auto">
                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <Settings2 className="h-4 w-4 mr-2" />
                    <span>{showSettings ? 'Hide Settings' : 'Configure Timer'}</span>
                </Button>

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="p-6 space-y-6 shadow-medium bg-gray-50/50 border-gray-200 rounded-2xl">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Focus</Label>
                                        <Input
                                            type="number"
                                            className="bg-white border-gray-200 text-center font-medium shadow-sm"
                                            value={settings.pomodoro}
                                            onChange={(e) => updateSettings({ pomodoro: parseInt(e.target.value) || 25 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Short</Label>
                                        <Input
                                            type="number"
                                            className="bg-white border-gray-200 text-center font-medium shadow-sm"
                                            value={settings.shortBreak}
                                            onChange={(e) => updateSettings({ shortBreak: parseInt(e.target.value) || 5 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Long</Label>
                                        <Input
                                            type="number"
                                            className="bg-white border-gray-200 text-center font-medium shadow-sm"
                                            value={settings.longBreak}
                                            onChange={(e) => updateSettings({ longBreak: parseInt(e.target.value) || 15 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="auto-breaks" className="text-sm font-medium text-gray-700">Auto-start Breaks</Label>
                                        <Switch
                                            id="auto-breaks"
                                            checked={settings.autoStartBreaks}
                                            onCheckedChange={(c) => updateSettings({ autoStartBreaks: c })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="auto-pomodoros" className="text-sm font-medium text-gray-700">Auto-start Pomodoros</Label>
                                        <Switch
                                            id="auto-pomodoros"
                                            checked={settings.autoStartPomodoros}
                                            onCheckedChange={(c) => updateSettings({ autoStartPomodoros: c })}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
