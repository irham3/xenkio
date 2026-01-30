import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerConfig, TimerState, TimerMode } from '../types';

export function useTimer(initialConfig: Partial<TimerConfig> = {}) {
    const [config, setConfig] = useState<TimerConfig>({
        mode: 'countdown',
        duration: 300, // 5 minutes default
        deadline: '',
        label: '',
        autoStart: false,
        soundEnabled: true,
        ...initialConfig,
    });

    const [state, setState] = useState<TimerState>({
        remainingTime: config.duration,
        isActive: false,
        isPaused: false,
        initialDuration: config.duration,
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const calculateRemainingFromDeadline = useCallback((deadlineStr: string) => {
        if (!deadlineStr || !deadlineStr.includes(':')) return 0;

        const now = new Date();
        const target = new Date(now); // Start with today's date

        try {
            const [hours, minutes] = deadlineStr.split(':').map(Number);
            target.setHours(hours, minutes, 0, 0);

            // If the target time has already passed today, assume it's for tomorrow
            if (target.getTime() <= now.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
            return isNaN(diff) ? 0 : diff;
        } catch (e) {
            console.error('Error calculating deadline:', e);
            return 0;
        }
    }, []);

    const start = useCallback(() => {
        setState(prev => ({ ...prev, isActive: true, isPaused: false }));
    }, []);

    const pause = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: true }));
    }, []);

    const resume = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: false }));
    }, []);

    const stop = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false, isPaused: false }));
    }, []);

    const reset = useCallback(() => {
        const newRemaining = config.mode === 'countdown'
            ? config.duration
            : calculateRemainingFromDeadline(config.deadline);

        setState({
            remainingTime: newRemaining,
            isActive: false,
            isPaused: false,
            initialDuration: newRemaining,
        });
    }, [config, calculateRemainingFromDeadline]);

    const updateConfig = useCallback((newConfig: Partial<TimerConfig>) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };

            // If duration or deadline changed, reset the state
            if (newConfig.duration !== undefined || newConfig.deadline !== undefined || newConfig.mode !== undefined) {
                const newRemaining = updated.mode === 'countdown'
                    ? updated.duration
                    : calculateRemainingFromDeadline(updated.deadline);

                setState({
                    remainingTime: newRemaining,
                    isActive: updated.autoStart,
                    isPaused: false,
                    initialDuration: newRemaining,
                });
            }

            return updated;
        });
    }, [calculateRemainingFromDeadline]);

    useEffect(() => {
        if (state.isActive && !state.isPaused && state.remainingTime > 0) {
            intervalRef.current = setInterval(() => {
                setState(prev => {
                    let newRemaining = prev.remainingTime - 1;

                    // Re-sync with wall clock for deadline mode to avoid drift
                    if (config.mode === 'deadline') {
                        newRemaining = calculateRemainingFromDeadline(config.deadline);
                    }

                    if (newRemaining <= 0) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return { ...prev, remainingTime: 0, isActive: false };
                    }
                    return { ...prev, remainingTime: newRemaining };
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [state.isActive, state.isPaused, state.remainingTime, config.mode, config.deadline, calculateRemainingFromDeadline]);

    // Handle completion sound
    useEffect(() => {
        if (state.remainingTime === 0 && config.soundEnabled && !state.isActive && state.initialDuration > 0) {
            // Logic for sound would go here
            // For now we'll just log
            console.log('Timer finished!');
        }
    }, [state.remainingTime, config.soundEnabled, state.isActive, state.initialDuration]);

    return {
        config,
        state,
        start,
        pause,
        resume,
        stop,
        reset,
        updateConfig,
    };
}
