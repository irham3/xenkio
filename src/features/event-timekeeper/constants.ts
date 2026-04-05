import { EventItem, TimekeeperConfig } from './types';

export const DEFAULT_CONFIG: TimekeeperConfig = {
    eventStartTime: '08:00',
    autoAdvance: false,
    warningThresholdMinutes: 5,
    criticalThresholdMinutes: 1,
};

export const SAMPLE_EVENTS: EventItem[] = [
    { id: '1', title: 'Pembukaan & Sambutan', presenter: 'MC', durationMinutes: 10, notes: '' },
    { id: '2', title: 'Keynote: Inovasi Teknologi', presenter: 'Dr. Ahmad', durationMinutes: 45, notes: '' },
    { id: '3', title: 'Coffee Break', presenter: '-', durationMinutes: 15, notes: '' },
    { id: '4', title: 'Panel Diskusi', presenter: 'Tim Panel', durationMinutes: 60, notes: '' },
    { id: '5', title: 'Penutupan', presenter: 'MC', durationMinutes: 10, notes: '' },
];
