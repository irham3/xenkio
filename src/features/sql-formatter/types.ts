
export type SqlLanguage =
    | 'sql'
    | 'bigquery'
    | 'db2'
    | 'db2i'
    | 'hive'
    | 'mariadb'
    | 'mysql'
    | 'n1ql'
    | 'plsql'
    | 'postgresql'
    | 'redshift'
    | 'singlestoredb'
    | 'snowflake'
    | 'spark'
    | 'sqlite'
    | 'tidb'
    | 'transactsql'
    | 'trino'
    | 'tsql';

export type IndentStyle = 'standard' | 'tabularLeft' | 'tabularRight';

export type KeywordCase = 'preserve' | 'upper' | 'lower';

export interface SqlFormatterOptions {
    sql: string;
    language: SqlLanguage;
    tabWidth: number;
    useTabs: boolean;
    keywordCase: KeywordCase;
    indentStyle: IndentStyle;
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
