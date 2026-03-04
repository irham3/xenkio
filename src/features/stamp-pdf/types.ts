
export type StampType = 'approval' | 'date' | 'notes' | 'checklist' | 'cost';

export type ApprovalStatus = 'approved' | 'rejected' | 'draft' | 'reviewed' | 'confidential';

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

export interface PDFStamp {
    id: string;
    type: StampType;
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
    rotation: number;
    opacity: number;

    // Approval stamp
    label?: string;
    status?: ApprovalStatus;
    signerName?: string;

    // Date stamp
    date?: string;
    dateLabel?: string;

    // Checklist stamp
    checklist?: ChecklistItem[];
    checklistTitle?: string;

    // Notes stamp
    notes?: string;

    // Cost stamp
    costLabel?: string;
    costAmount?: string;
    costCurrency?: string;

    // Styling
    color: string;
    borderColor: string;
    backgroundColor: string;
    fontSize: number;
}

import { LucideIcon } from 'lucide-react';

export interface StampTemplate {
    id: string;
    name: string;
    type: StampType;
    icon: LucideIcon;
    defaultConfig: Partial<PDFStamp>;
}


export interface PDFFile {
    file: File;
    name: string;
    size: number;
    totalPages: number;
    previewUrls: string[];
}

export interface StampPdfState {
    file: PDFFile | null;
    stamps: PDFStamp[];
    selectedStampId: string | null;
    editingStampId: string | null;
    currentPageIndex: number;
    isProcessing: boolean;
    error: string | null;
}
