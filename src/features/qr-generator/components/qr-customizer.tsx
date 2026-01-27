
'use client';

import { QRConfig } from '../types';
import { QR_ERROR_LEVELS } from '../constants';
import { Label } from '@/components/ui/label';

interface QrCustomizerProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export function QrCustomizer({ config, onChange }: QrCustomizerProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Foreground Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={config.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              className="h-10 w-10 rounded border p-1"
            />
            <input
              type="text"
              value={config.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={config.bgColor}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="h-10 w-10 rounded border p-1"
            />
            <input
              type="text"
              value={config.bgColor}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Error Correction Level</Label>
        <select
          value={config.level}
          onChange={(e) => onChange({ level: e.target.value as QRConfig['level'] })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {QR_ERROR_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
