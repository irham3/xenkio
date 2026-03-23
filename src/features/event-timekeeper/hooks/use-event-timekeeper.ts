import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EventItem, ScheduleEvent, TimekeeperConfig, TimekeeperState, EventStatus } from '../types';
import { DEFAULT_CONFIG, SAMPLE_EVENTS } from '../constants';

const STORAGE_KEY = 'xenkio-event-timekeeper-v1';

function addMinutesToTime(timeStr: string, minutes: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMin = h * 60 + m + minutes;
    const newH = Math.floor(totalMin / 60) % 24;
    const newM = totalMin % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function buildSchedule(
    items: EventItem[],
    startTime: string,
    activeIndex: number,
    elapsedSecondsMap: Record<string, number>
): ScheduleEvent[] {
    let plannedTime = startTime;
    let actualTime = startTime;

    return items.map((item, i) => {
        const plannedStart = plannedTime;
        const plannedEnd = addMinutesToTime(plannedStart, item.durationMinutes);

        let status: EventStatus = 'upcoming';
        if (i < activeIndex) status = 'completed';
        else if (i === activeIndex) status = 'ongoing';

        const elapsed = elapsedSecondsMap[item.id] ?? 0;

        // Calculate actual start/end for this event
        const actualStart = actualTime;
        const actualElapsedMin = Math.ceil(elapsed / 60);

        // For completed events, actual end = actualStart + how long it actually took
        // For others, use planned duration
        const eventActualDuration = status === 'completed' ? actualElapsedMin : item.durationMinutes;
        const actualEnd = addMinutesToTime(actualStart, eventActualDuration);

        // Cumulative delay = difference between actual start and planned start in minutes
        const [pH, pM] = plannedStart.split(':').map(Number);
        const [aH, aM] = actualStart.split(':').map(Number);
        const delayMinutes = (aH * 60 + aM) - (pH * 60 + pM);

        const event: ScheduleEvent = {
            ...item,
            startTime: plannedStart,
            endTime: plannedEnd,
            actualStartTime: actualStart,
            actualEndTime: actualEnd,
            status,
            elapsedSeconds: elapsed,
            delayMinutes,
        };

        // Advance planned time always by planned duration
        plannedTime = plannedEnd;

        // Advance actual time based on what really happened
        if (status === 'completed') {
            actualTime = addMinutesToTime(actualStart, actualElapsedMin);
        } else if (status === 'ongoing') {
            // ongoing: next session's actual start will shift based on elapsed so far
            const ongoingOverflow = Math.max(0, actualElapsedMin - item.durationMinutes);
            actualTime = addMinutesToTime(actualStart, item.durationMinutes + ongoingOverflow);
        } else {
            // upcoming: inherit whatever delay has been accumulated
            actualTime = addMinutesToTime(actualStart, item.durationMinutes);
        }

        return event;
    });
}

export function useEventTimekeeper(initialItems?: EventItem[]) {
    const [items, setItems] = useState<EventItem[]>(initialItems ?? SAMPLE_EVENTS);
    const [config, setConfig] = useState<TimekeeperConfig>(DEFAULT_CONFIG);
    const [activeIndex, setActiveIndex] = useState(-1); // -1 = not started
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [elapsedSecondsMap, setElapsedSecondsMap] = useState<Record<string, number>>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.items) setItems(data.items);
                if (data.config) setConfig(data.config);
                if (data.activeIndex !== undefined) setActiveIndex(data.activeIndex);
                if (data.isRunning !== undefined) setIsRunning(data.isRunning);
                if (data.isPaused !== undefined) setIsPaused(data.isPaused);
                if (data.elapsedSecondsMap) setElapsedSecondsMap(data.elapsedSecondsMap);
                if (data.isFocusMode !== undefined) setIsFocusMode(data.isFocusMode);
            } catch (e) {
                console.error('Failed to load event-timekeeper state', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (!isLoaded) return;

        const stateToSave = {
            items,
            config,
            activeIndex,
            isRunning,
            isPaused,
            elapsedSecondsMap,
            isFocusMode,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [items, config, activeIndex, isRunning, isPaused, elapsedSecondsMap, isFocusMode, isLoaded]);

    // Build the computed schedule
    const schedule = useMemo(
        () => buildSchedule(items, config.eventStartTime, activeIndex, elapsedSecondsMap),
        [items, config.eventStartTime, activeIndex, elapsedSecondsMap]
    );

    const activeEvent = activeIndex >= 0 && activeIndex < schedule.length ? schedule[activeIndex] : null;
    const nextEvent = activeIndex + 1 < schedule.length ? schedule[activeIndex + 1] : null;

    const remainingSeconds = activeEvent
        ? Math.max(0, activeEvent.durationMinutes * 60 - activeEvent.elapsedSeconds)
        : 0;

    // Tick
    useEffect(() => {
        if (isRunning && !isPaused && activeEvent) {
            intervalRef.current = setInterval(() => {
                setElapsedSecondsMap(prev => {
                    const id = items[activeIndex]?.id;
                    if (!id) return prev;
                    const current = prev[id] ?? 0;
                    const max = items[activeIndex].durationMinutes * 60;

                    if (current + 1 > max && config.autoAdvance) {
                        // Auto advance to next
                        return prev;
                    }

                    return { ...prev, [id]: current + 1 };
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, isPaused, activeIndex, items, activeEvent, config.autoAdvance]);

    // Auto advance when time is up
    useEffect(() => {
        if (!config.autoAdvance || !activeEvent || !isRunning) return;
        if (remainingSeconds <= 0 && activeIndex < items.length - 1) {
            advanceNext();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingSeconds, config.autoAdvance]);

    const startSchedule = useCallback(() => {
        if (items.length === 0) return;
        setActiveIndex(0);
        setIsRunning(true);
        setIsPaused(false);
    }, [items.length]);

    const pause = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        setIsPaused(false);
    }, []);

    const stop = useCallback(() => {
        setIsRunning(false);
        setIsPaused(false);
        setActiveIndex(-1);
        setElapsedSecondsMap({});
    }, []);

    const advanceNext = useCallback(() => {
        setActiveIndex(prev => {
            if (prev + 1 >= items.length) {
                // All done
                setIsRunning(false);
                return prev;
            }
            return prev + 1;
        });
    }, [items.length]);

    const goToPrevious = useCallback(() => {
        setActiveIndex(prev => Math.max(0, prev - 1));
    }, []);

    const jumpTo = useCallback((index: number) => {
        if (index >= 0 && index < items.length) {
            setActiveIndex(index);
            if (!isRunning) {
                setIsRunning(true);
                setIsPaused(false);
            }
        }
    }, [items.length, isRunning]);

    const addEvent = useCallback((event: EventItem) => {
        setItems(prev => [...prev, event]);
    }, []);

    const removeEvent = useCallback((id: string) => {
        setItems(prev => prev.filter(e => e.id !== id));
    }, []);

    const updateEvent = useCallback((id: string, updates: Partial<EventItem>) => {
        setItems(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    }, []);

    const reorderEvents = useCallback((newItems: EventItem[]) => {
        setItems(newItems);
    }, []);

    const adjustDuration = useCallback((id: string, deltaMinutes: number) => {
        setItems(prev => prev.map(e =>
            e.id === id
                ? { ...e, durationMinutes: Math.max(1, e.durationMinutes + deltaMinutes) }
                : e
        ));
    }, []);

    const importEvents = useCallback((newEvents: EventItem[]) => {
        setItems(newEvents);
        setActiveIndex(-1);
        setIsRunning(false);
        setIsPaused(false);
        setElapsedSecondsMap({});
    }, []);

    const updateConfig = useCallback((newConfig: Partial<TimekeeperConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const toggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => !prev);
    }, []);

    const totalDurationMinutes = items.reduce((sum, e) => sum + e.durationMinutes, 0);
    const estimatedEndTime = addMinutesToTime(config.eventStartTime, totalDurationMinutes);

    const state: TimekeeperState = {
        events: schedule,
        activeIndex,
        isRunning,
        isPaused,
        isFocusMode,
    };

    return {
        state,
        config,
        items,
        activeEvent,
        nextEvent,
        remainingSeconds,
        totalDurationMinutes,
        estimatedEndTime,
        startSchedule,
        pause,
        resume,
        stop,
        advanceNext,
        goToPrevious,
        jumpTo,
        addEvent,
        removeEvent,
        updateEvent,
        reorderEvents,
        adjustDuration,
        importEvents,
        updateConfig,
        toggleFocusMode,
    };
}
