export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'overtime';

export interface EventItem {
    id: string;
    title: string;
    presenter: string;
    durationMinutes: number;
    notes: string;
}

export interface ScheduleEvent extends EventItem {
    startTime: string;        // HH:mm — planned
    endTime: string;          // HH:mm — planned
    actualStartTime: string;  // HH:mm — adjusted for delays
    actualEndTime: string;    // HH:mm — adjusted for delays
    status: EventStatus;
    elapsedSeconds: number;
    delayMinutes: number;     // cumulative delay from original schedule (positive = late)
}

export interface TimekeeperConfig {
    eventStartTime: string; // HH:mm — the time the first event starts
    autoAdvance: boolean;
    warningThresholdMinutes: number;
    criticalThresholdMinutes: number;
}

export interface TimekeeperState {
    events: ScheduleEvent[];
    activeIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    isFocusMode: boolean;
}
