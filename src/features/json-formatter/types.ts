export type IndentType = 'spaces' | 'tabs';
export type IndentSize = 2 | 4 | 8;

export interface JsonFormatterOptions {
    json: string;
    indentType: IndentType;
    indentSize: IndentSize;
    sortKeys: boolean;
}

export interface JsonFormatterResult {
    formatted: string;
    originalSize: number;
    formattedSize: number;
    executionTime: number;
    error?: string;
    isValid: boolean;
}

export interface FormatStats {
    originalSize: number;
    formattedSize: number;
    compressionRatio: number;
}
