
'use client';

import { QRConfig } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface QrGeneratorFormProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export function QrGeneratorForm({ config, onChange }: QrGeneratorFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="qr-content">Content</Label>
        <Input
          id="qr-content"
          value={config.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Enter text or URL"
          className="w-full"
        />
        <p className="text-sm text-gray-500">
          Enter the link or text you want to encode.
        </p>
      </div>

      {/* More form fields can be added here for colors, etc. */}
    </div>
  );
}
