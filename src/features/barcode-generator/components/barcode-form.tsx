'use client';

import { BarcodeConfig, BarcodeFormat } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface BarcodeFormProps {
    config: BarcodeConfig;
    onChange: (updates: Partial<BarcodeConfig>) => void;
}

export function BarcodeForm({ config, onChange }: BarcodeFormProps) {
    const formats: { value: BarcodeFormat; label: string }[] = [
        { value: 'CODE128', label: 'CODE128' },
        { value: 'CODE128A', label: 'CODE128A' },
        { value: 'CODE128B', label: 'CODE128B' },
        { value: 'CODE128C', label: 'CODE128C' },
        { value: 'EAN13', label: 'EAN13' },
        { value: 'EAN8', label: 'EAN8' },
        { value: 'UPC', label: 'UPC' },
        { value: 'CODE39', label: 'CODE39' },
        { value: 'ITF14', label: 'ITF14' },
        { value: 'ITF', label: 'ITF' },
        { value: 'MSI', label: 'MSI' },
        { value: 'MSI10', label: 'MSI10' },
        { value: 'MSI11', label: 'MSI11' },
        { value: 'MSI1010', label: 'MSI1010' },
        { value: 'MSI1110', label: 'MSI1110' },
        { value: 'pharmacode', label: 'Pharmacode' },
    ];

    return (
        <div className="space-y-6">
            {/* Barcode Value */}
            <div className="space-y-2">
                <Label htmlFor="barcode-value">Value</Label>
                <Input
                    id="barcode-value"
                    value={config.value}
                    onChange={(e) => onChange({ value: e.target.value })}
                    placeholder="Enter barcode value"
                />
                <p className="text-sm text-gray-500">
                    Enter the data you want to encode.
                </p>
            </div>

            {/* Barcode Format */}
            <div className="space-y-2">
                <Label htmlFor="barcode-format">Format</Label>
                <Select
                    value={config.format}
                    onValueChange={(val: BarcodeFormat) => onChange({ format: val })}
                >
                    <SelectTrigger id="barcode-format">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        {formats.map((fmt) => (
                            <SelectItem key={fmt.value} value={fmt.value}>
                                {fmt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Display Value Checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="display-value"
                    checked={config.displayValue}
                    onCheckedChange={(checked) =>
                        onChange({ displayValue: checked as boolean })
                    }
                />
                <Label htmlFor="display-value">Show Text (Value)</Label>
            </div>
        </div>
    );
}
