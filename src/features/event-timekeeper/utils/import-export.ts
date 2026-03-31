import { EventItem } from '../types';

export function parseCSV(text: string): EventItem[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Try to detect header
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('title') || header.includes('nama') || header.includes('session') || header.includes('acara');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines
        .filter(line => line.trim())
        .map((line, i) => {
            // Support both comma and tab separated
            const sep = line.includes('\t') ? '\t' : ',';
            const cols = line.split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));

            return {
                id: crypto.randomUUID(),
                title: cols[0] || `Session ${i + 1}`,
                presenter: cols[1] || '-',
                durationMinutes: parseInt(cols[2]) || 15,
                notes: cols[3] || '',
            };
        });
}

export function eventsToCSV(events: EventItem[]): string {
    const header = 'Title,Presenter,Duration (minutes),Notes';
    const rows = events.map(e =>
        `"${e.title}","${e.presenter}",${e.durationMinutes},"${e.notes}"`
    );
    return [header, ...rows].join('\n');
}
