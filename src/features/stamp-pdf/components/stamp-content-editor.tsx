
'use client';

import React from 'react';
import { PDFStamp, ChecklistItem } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface StampContentEditorProps {
    stamp: PDFStamp;
    onUpdate: (id: string, updates: Partial<PDFStamp>) => void;
}

export function StampContentEditor({ stamp, onUpdate }: StampContentEditorProps) {
    switch (stamp.type) {
        case 'approval':
            return <ApprovalEditor stamp={stamp} onUpdate={onUpdate} />;
        case 'date':
            return <DateEditor stamp={stamp} onUpdate={onUpdate} />;
        case 'checklist':
            return <ChecklistEditor stamp={stamp} onUpdate={onUpdate} />;
        case 'notes':
            return <NotesEditor stamp={stamp} onUpdate={onUpdate} />;
        case 'cost':
            return <CostEditor stamp={stamp} onUpdate={onUpdate} />;
        default:
            return null;
    }
}

function ApprovalEditor({ stamp, onUpdate }: StampContentEditorProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Approval Stamp</h4>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Label</label>
                <Input
                    value={stamp.label || ''}
                    onChange={(e) => onUpdate(stamp.id, { label: e.target.value })}
                    placeholder="APPROVED"
                    className="h-8 text-sm"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Signer Name</label>
                <Input
                    value={stamp.signerName || ''}
                    onChange={(e) => onUpdate(stamp.id, { signerName: e.target.value })}
                    placeholder="John Doe"
                    className="h-8 text-sm"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                <Input
                    type="date"
                    value={stamp.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => onUpdate(stamp.id, { date: e.target.value })}
                    className="h-8 text-sm"
                />
            </div>
        </div>
    );
}

function DateEditor({ stamp, onUpdate }: StampContentEditorProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Date Stamp</h4>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Label</label>
                <Input
                    value={stamp.dateLabel || ''}
                    onChange={(e) => onUpdate(stamp.id, { dateLabel: e.target.value })}
                    placeholder="Date"
                    className="h-8 text-sm"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                <Input
                    type="date"
                    value={stamp.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => onUpdate(stamp.id, { date: e.target.value })}
                    className="h-8 text-sm"
                />
            </div>
        </div>
    );
}

function ChecklistEditor({ stamp, onUpdate }: StampContentEditorProps) {
    const items = stamp.checklist || [];

    const toggleItem = (itemId: string) => {
        const updated = items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        onUpdate(stamp.id, { checklist: updated });
    };

    const updateItemText = (itemId: string, text: string) => {
        const updated = items.map((item) =>
            item.id === itemId ? { ...item, text } : item
        );
        onUpdate(stamp.id, { checklist: updated });
    };

    const addItem = () => {
        const newItem: ChecklistItem = {
            id: uuidv4(),
            text: `Item ${items.length + 1}`,
            checked: false,
        };
        onUpdate(stamp.id, { checklist: [...items, newItem] });
    };

    const removeItem = (itemId: string) => {
        onUpdate(stamp.id, { checklist: items.filter((i) => i.id !== itemId) });
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Checklist Stamp</h4>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                <Input
                    value={stamp.checklistTitle || ''}
                    onChange={(e) => onUpdate(stamp.id, { checklistTitle: e.target.value })}
                    placeholder="Checklist"
                    className="h-8 text-sm"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 block">Items</label>
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleItem(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 accent-primary-600 cursor-pointer"
                        />
                        <Input
                            value={item.text}
                            onChange={(e) => updateItemText(item.id, e.target.value)}
                            className="h-7 text-sm flex-1"
                        />
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="w-full h-7 text-xs mt-1"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                </Button>
            </div>
        </div>
    );
}

function NotesEditor({ stamp, onUpdate }: StampContentEditorProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Notes Stamp</h4>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
                <textarea
                    value={stamp.notes || ''}
                    onChange={(e) => onUpdate(stamp.id, { notes: e.target.value })}
                    placeholder="Write your notes here..."
                    className="w-full h-24 rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>
        </div>
    );
}

function CostEditor({ stamp, onUpdate }: StampContentEditorProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Cost / Fee Stamp</h4>
            <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Label</label>
                <Input
                    value={stamp.costLabel || ''}
                    onChange={(e) => onUpdate(stamp.id, { costLabel: e.target.value })}
                    placeholder="Total"
                    className="h-8 text-sm"
                />
            </div>
            <div className="flex gap-2">
                <div className="w-24">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Currency</label>
                    <Input
                        value={stamp.costCurrency || 'IDR'}
                        onChange={(e) => onUpdate(stamp.id, { costCurrency: e.target.value })}
                        placeholder="IDR"
                        className="h-8 text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Amount</label>
                    <Input
                        type="number"
                        value={stamp.costAmount || ''}
                        onChange={(e) => onUpdate(stamp.id, { costAmount: e.target.value })}
                        placeholder="0"
                        className="h-8 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
