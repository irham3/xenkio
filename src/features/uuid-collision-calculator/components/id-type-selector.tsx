'use client';

import { cn } from '@/lib/utils';
import { ID_TYPES } from '../lib/collision-utils';
import { IdTypeKey } from '../types';

interface IdTypeSelectorProps {
    value: IdTypeKey;
    onChange: (key: IdTypeKey) => void;
    customBits: number;
    onCustomBitsChange: (bits: number) => void;
}

export function IdTypeSelector({ value, onChange, customBits, onCustomBitsChange }: IdTypeSelectorProps) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                Identifier Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ID_TYPES.map((type) => (
                    <button
                        key={type.key}
                        onClick={() => onChange(type.key)}
                        className={cn(
                            'flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                            value === type.key
                                ? 'border-primary-500 bg-primary-50/40 text-primary-900'
                                : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 hover:text-gray-800'
                        )}
                    >
                        <span className="text-sm font-black">{type.shortLabel}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">
                            {type.key === 'custom' ? `${customBits} bits` : `${type.bits} bits`}
                        </span>
                    </button>
                ))}
            </div>

            {value === 'custom' && (
                <div className="pt-2 space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                            Bits of Entropy
                        </label>
                        <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                            {customBits} bits
                        </span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="256"
                        step="1"
                        value={customBits}
                        onChange={(e) => onCustomBitsChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        <span>8</span>
                        <span>128</span>
                        <span>256</span>
                    </div>
                </div>
            )}
        </div>
    );
}
