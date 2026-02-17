import { cn } from '@/lib/utils';

interface TimerPresetsProps {
    onSelect: (seconds: number) => void;
    currentDuration: number;
}

const PRESETS = [
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
    { label: 'Pomodoro', seconds: 1500 },
    { label: 'Short Break', seconds: 300 },
    { label: 'Long Break', seconds: 900 },
    { label: '1h', seconds: 3600 },
];

export function TimerPresets({ onSelect, currentDuration }: TimerPresetsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => onSelect(preset.seconds)}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        currentDuration === preset.seconds
                            ? "bg-primary-50 border-primary-200 text-primary-700 font-semibold"
                            : "bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:text-primary-600"
                    )}
                >
                    {preset.label}
                </button>
            ))}
        </div>
    );
}
