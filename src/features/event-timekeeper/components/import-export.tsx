'use client';

import { EventItem } from '../types';
import { UploadSimple, DownloadSimple, FileXls } from '@phosphor-icons/react/dist/ssr';
import { useCallback, useRef, useState } from 'react';
import { PasteImportModal } from './paste-import-modal';
import { parseCSV, eventsToCSV } from '../utils/import-export';

interface ImportExportProps {
    items: EventItem[];
    onImport: (events: EventItem[]) => void;
}


export function ImportExport({ items, onImport }: ImportExportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'csv' || ext === 'txt' || ext === 'tsv') {
            const text = await file.text();
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
                onImport(parsed);
            }
        } else if (ext === 'xlsx' || ext === 'xls') {
            // Dynamic import xlsx to keep bundle small
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const XLSX = await (import('xlsx' as string) as Promise<any>);
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows: Record<string, string | number>[] = XLSX.utils.sheet_to_json(sheet);

                const parsed: EventItem[] = rows.map((row: Record<string, string | number>, i: number) => {
                    // Try many column name variants
                    const title = String(row['Title'] ?? row['title'] ?? row['Nama'] ?? row['nama'] ?? row['Session'] ?? row['Acara'] ?? row['acara'] ?? `Session ${i + 1}`);
                    const presenter = String(row['Presenter'] ?? row['presenter'] ?? row['Speaker'] ?? row['speaker'] ?? row['Pembicara'] ?? row['pembicara'] ?? '-');
                    const dur = parseInt(String(row['Duration'] ?? row['duration'] ?? row['Durasi'] ?? row['durasi'] ?? row['Duration (minutes)'] ?? '15')) || 15;
                    const notes = String(row['Notes'] ?? row['notes'] ?? row['Catatan'] ?? row['catatan'] ?? '');

                    return {
                        id: crypto.randomUUID(),
                        title,
                        presenter,
                        durationMinutes: dur,
                        notes,
                    };
                });

                if (parsed.length > 0) {
                    onImport(parsed);
                }
            } catch {
                // Fallback: tell user xlsx isn't available, use CSV
                alert('Excel import requires the "xlsx" library. Please export your file as CSV instead, or install xlsx: npm install xlsx');
            }
        } else if (ext === 'json') {
            try {
                const text = await file.text();
                const data = JSON.parse(text) as EventItem[];
                if (Array.isArray(data) && data.length > 0) {
                    const parsed = data.map((item, i) => ({
                        id: crypto.randomUUID(),
                        title: item.title || `Session ${i + 1}`,
                        presenter: item.presenter || '-',
                        durationMinutes: item.durationMinutes || 15,
                        notes: item.notes || '',
                    }));
                    onImport(parsed);
                }
            } catch {
                alert('Invalid JSON file');
            }
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [onImport]);

    const handleExport = useCallback(() => {
        const csv = eventsToCSV(items);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event-schedule.csv';
        a.click();
        URL.revokeObjectURL(url);
    }, [items]);

    return (
        <div className="flex items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls,.json"
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
                <UploadSimple className="w-3.5 h-3.5"  weight="duotone"/>
                Import File
            </button>
            <button
                onClick={() => setIsPasteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
                <UploadSimple className="w-3.5 h-3.5"  weight="duotone"/>
                Paste
            </button>
            <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors"
                title="Export as CSV"
            >
                <DownloadSimple className="w-3.5 h-3.5"  weight="duotone"/>
                Export
            </button>
            <div className="flex items-center gap-1 text-[10px] text-gray-300">
                <FileXls className="w-3 h-3"  weight="duotone"/>
                CSV, Excel, JSON
            </div>

            <PasteImportModal
                isOpen={isPasteModalOpen}
                onClose={() => setIsPasteModalOpen(false)}
                onImport={(events: EventItem[]) => {
                    onImport(events);
                    setIsPasteModalOpen(false);
                }}
            />
        </div>
    );
}
