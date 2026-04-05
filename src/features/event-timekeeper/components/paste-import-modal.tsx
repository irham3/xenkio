'use client';

import { EventItem } from '../types';
import { parseCSV } from '../utils/import-export';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { ClipboardPaste, Info } from 'lucide-react';

interface PasteImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (events: EventItem[]) => void;
}

export function PasteImportModal({ isOpen, onClose, onImport }: PasteImportModalProps) {
    const [text, setText] = useState('');

    const handleImport = () => {
        if (!text.trim()) return;
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
            onImport(parsed);
            setText('');
        } else {
            alert('Could not parse any valid sessions. Please check the format.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardPaste className="w-5 h-5 text-primary-500" />
                        Paste Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                        <div className="flex items-center gap-2 font-semibold mb-1">
                            <Info className="w-3.5 h-3.5" />
                            Format Guide
                        </div>
                        <p className="mb-2">
                            Copy rows from Excel/Sheets or use the format below (Title, Presenter, Duration, Notes):
                        </p>
                        <pre className="bg-white/50 p-2 rounded border border-blue-200 font-mono overflow-x-auto">
                            {`Opening Ceremony\tMC\t10\tWelcome speech
Keynote Session\tJohn Doe\t45\tFuture of Tech
Coffee Break\t-\t15\tNetworking time`}
                        </pre>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your schedule here..."
                        className="w-full h-64 p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono"
                    />
                </div>

                <DialogFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!text.trim()}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Import Sessions
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
