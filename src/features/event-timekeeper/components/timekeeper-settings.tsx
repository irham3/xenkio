'use client';

import { TimekeeperConfig } from '../types';
import { Gear } from '@phosphor-icons/react/dist/ssr';

interface TimekeeperSettingsProps {
    config: TimekeeperConfig;
    onChange: (config: Partial<TimekeeperConfig>) => void;
    totalDuration: number;
    estimatedEnd: string;
}

export function TimekeeperSettings({
    config,
    onChange,
    totalDuration,
    estimatedEnd,
}: TimekeeperSettingsProps) {
    const totalH = Math.floor(totalDuration / 60);
    const totalM = totalDuration % 60;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Gear className="w-4 h-4"  weight="duotone"/>
                Settings
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Event Start Time</label>
                <input
                    type="time"
                    value={config.eventStartTime}
                    onChange={e => onChange({ eventStartTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none text-sm font-mono"
                />
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-xs text-gray-500">
                <span>Total: <strong className="text-gray-700">{totalH}h {totalM}m</strong></span>
                <span>Est. End: <strong className="text-gray-700">{estimatedEnd}</strong></span>
            </div>

            {/* Auto Advance */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.autoAdvance}
                    onChange={e => onChange({ autoAdvance: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Auto-advance to next session</span>
            </label>

            {/* Warning Thresholds */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Warning (min)</label>
                    <input
                        type="number"
                        min={1}
                        max={30}
                        value={config.warningThresholdMinutes}
                        onChange={e => onChange({ warningThresholdMinutes: parseInt(e.target.value) || 5 })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-medium text-red-600 uppercase tracking-wider">Critical (min)</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={config.criticalThresholdMinutes}
                        onChange={e => onChange({ criticalThresholdMinutes: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-red-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
