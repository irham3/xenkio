
export type SqlKeywordCase = 'upper' | 'lower' | 'preserve';
export type SqlIndentType = 'SPACE' | 'TAB';
export type SqlIndentSize = 2 | 4 | 8;
export type SqlDialect = 'standard' | 'mysql' | 'postgresql' | 'sqlite' | 'mssql';

export interface SqlFormatterOptions {
    sql: string;
    keywordCase: SqlKeywordCase;
    indentType: SqlIndentType;
    indentSize: SqlIndentSize;
    dialect: SqlDialect;
}

export interface SqlFormatterResult {
    formatted: string;
    isValid: boolean;
    error?: string;
    executionTime?: number;
}

export interface SqlFormatterStats {
    originalSize: number;
    formattedSize: number;
}
