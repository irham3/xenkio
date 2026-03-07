'use client';

import { cn } from '@/lib/utils';
import { CronField, CronFieldType } from '../types';
import { CRON_FIELD_META } from '../lib/cron-utils';

interface CronFieldEditorProps {
    fieldType: CronFieldType;
    field: CronField;
    onChange: (fieldType: CronFieldType, field: CronField) => void;
}

export function CronFieldEditor({ fieldType, field, onChange }: CronFieldEditorProps) {
    const meta = CRON_FIELD_META[fieldType];
    const types: CronField['type'][] = ['every', 'specific', 'step', 'range'];
    const typeLabels: Record<CronField['type'], string> = {
        every: 'Every',
        specific: 'Specific',
        step: 'Interval',
        range: 'Range',
    };

    const handleTypeChange = (type: CronField['type']) => {
        const newField: CronField = { type, values: [] };
        if (type === 'step') newField.stepValue = fieldType === 'minute' ? 5 : 1;
        if (type === 'range') {
            newField.rangeStart = meta.min;
            newField.rangeEnd = meta.max;
        }
        onChange(fieldType, newField);
    };

    const handleToggleValue = (val: number) => {
        const newValues = field.values.includes(val)
            ? field.values.filter(v => v !== val)
            : [...field.values, val];
        onChange(fieldType, { ...field, values: newValues });
    };

    const allValues: number[] = [];
    for (let i = meta.min; i <= meta.max; i++) allValues.push(i);

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                {meta.label}
            </label>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                {types.map(t => (
                    <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={cn(
                            "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                            field.type === t
                                ? "bg-white text-primary-600 border border-gray-100 shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                        )}
                    >
                        {typeLabels[t]}
                    </button>
                ))}
            </div>

            {/* Specific values */}
            {field.type === 'specific' && (
                <div className={cn(
                    "flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50/50 rounded-xl border border-gray-100",
                    fieldType === 'minute' && "max-h-40"
                )}>
                    {allValues.map(val => {
                        const label = meta.displayLabels
                            ? meta.displayLabels[val - meta.min]
                            : val.toString();
                        return (
                            <button
                                key={val}
                                onClick={() => handleToggleValue(val)}
                                className={cn(
                                    "min-w-[36px] h-8 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                    field.values.includes(val)
                                        ? "bg-primary-500 text-white shadow-sm"
                                        : "bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-200"
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Step value */}
            {field.type === 'step' && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Every</span>
                    <input
                        type="number"
                        min={1}
                        max={meta.max}
                        value={field.stepValue ?? 1}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1 && val <= meta.max) {
                                onChange(fieldType, { ...field, stepValue: val });
                            }
                        }}
                        className="w-20 h-10 bg-white rounded-xl border border-gray-200 px-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <span className="text-sm text-gray-500">{meta.label.toLowerCase()}(s)</span>
                </div>
            )}

            {/* Range */}
            {field.type === 'range' && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">From</span>
                    <input
                        type="number"
                        min={meta.min}
                        max={meta.max}
                        value={field.rangeStart ?? meta.min}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= meta.min && val <= meta.max) {
                                onChange(fieldType, { ...field, rangeStart: val });
                            }
                        }}
                        className="w-20 h-10 bg-white rounded-xl border border-gray-200 px-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                        type="number"
                        min={meta.min}
                        max={meta.max}
                        value={field.rangeEnd ?? meta.max}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= meta.min && val <= meta.max) {
                                onChange(fieldType, { ...field, rangeEnd: val });
                            }
                        }}
                        className="w-20 h-10 bg-white rounded-xl border border-gray-200 px-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>
            )}
        </div>
    );
}
