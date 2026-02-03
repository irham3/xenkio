export interface PdfFile {
    file: File;
    name: string;
    size: number;
    pageCount?: number;
    isEncrypted?: boolean;
}

export type SecurityAction = 'protect' | 'unlock';

export interface SecurityOptions {
    action: SecurityAction;
    password?: string;
    ownerPassword?: string;
    permissions?: {
        printing?: boolean;
        modifying?: boolean;
        copying?: boolean;
        annotating?: boolean;
    };
}

export interface ProcessingStatus {
    status: 'idle' | 'processing' | 'success' | 'error';
    message?: string;
    progress?: number;
}
