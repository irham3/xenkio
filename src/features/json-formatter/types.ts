
export type IndentType = 'SPACE' | 'TAB';
export type IndentSize = 2 | 4 | 8;

export interface JsonFormatterOptions {
    json: string;
    indentType: IndentType;
    indentSize: IndentSize;
    sortKeys: boolean;
}

export interface JsonFormatterResult {
    formatted: string;
    isValid: boolean;
    error?: string;
    executionTime?: number;
}

export interface JsonFormatterStats {
    originalSize: number;
    formattedSize: number;
}
