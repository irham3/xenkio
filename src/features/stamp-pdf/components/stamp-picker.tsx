
'use client';

import React from 'react';
import { STAMP_TEMPLATES } from '../constants';
import { StampTemplate } from '../types';
import { cn } from '@/lib/utils';

interface StampPickerProps {
    onSelect: (template: StampTemplate) => void;
}

export function StampPicker({ onSelect }: StampPickerProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Add Stamp</h3>
            <div className="grid grid-cols-2 gap-2">
                {STAMP_TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className={cn(
                            'flex items-center gap-2 p-2.5 rounded-lg border border-gray-200',
                            'hover:border-primary-300 hover:bg-primary-50/50 transition-all',
                            'text-left cursor-pointer group'
                        )}
                    >
                        <template.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 group-hover:text-primary-700 truncate">
                                {template.name}
                            </p>
                            <p className="text-[10px] text-gray-400 capitalize">{template.type}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
