import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerSettings } from '../types';
import { DEFAULT_SETTINGS, TIMER_MODES } from '../constants';
import { toast } from 'sonner';

export const usePomodoro = (initialSettings: TimerSettings = DEFAULT_SETTINGS) => {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoro * 60);
    const [totalDuration, setTotalDuration] = useState(DEFAULT_SETTINGS.pomodoro * 60);
    const [isActive, setIsActive] = useState(false);
    const [settings, setSettings] = useState<TimerSettings>(initialSettings);

    // Derived progress
    const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playNotificationSound = useCallback(() => {
        if (!settings.soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                audioContextRef.current = new AudioContextClass();
            }

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(500, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (error) {
            console.error('Audio playback failed', error);
        }
    }, [settings.soundEnabled]);

    const unlockAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        const duration = settings[newMode] * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, [settings]);

    const toggleTimer = useCallback(() => {
        if (!isActive) {
            unlockAudio();
        }
        setIsActive(!isActive);
    }, [isActive, unlockAudio]);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        const duration = settings[mode] * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
    }, [mode, settings]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Push state update to next tick to avoid cascading render warning
            setTimeout(() => {
                setIsActive(false);
                playNotificationSound();

                // Notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification('Timer Complete!', {
                        body: `${TIMER_MODES[mode].label} finished.`,
                        icon: '/favicon.ico'
                    });
                }

                toast.success(`${TIMER_MODES[mode].label} session complete!`);
            }, 0);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, mode, playNotificationSound]);

    // Update time left if settings change while NOT active (to reflect new duration)
    // Only if the timer is full (user hasn't started yet)
    useEffect(() => {
        if (!isActive && timeLeft === totalDuration) {
            const newDuration = settings[mode] * 60;
            if (newDuration !== totalDuration) {
                // Defer state update to next tick
                setTimeout(() => {
                    setTimeLeft(newDuration);
                    setTotalDuration(newDuration);
                }, 0);
            }
        }
    }, [settings, mode, isActive, timeLeft, totalDuration]);

    // Request notification permission on mount
    useEffect(() => {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    return {
        mode,
        timeLeft,
        isActive,
        progress,
        settings,
        switchMode,
        toggleTimer,
        resetTimer,
        updateSettings,
    };
};
