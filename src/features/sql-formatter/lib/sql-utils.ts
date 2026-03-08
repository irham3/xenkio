
import { format } from 'sql-formatter';
import type { SqlLanguage, KeywordCase, IndentStyle } from '../types';

export function formatSql(
    sql: string,
    language: SqlLanguage,
    tabWidth: number,
    useTabs: boolean,
    keywordCase: KeywordCase,
    indentStyle: IndentStyle
): string {
    try {
        return format(sql, {
            language,
            tabWidth,
            useTabs,
            keywordCase,
            indentStyle,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`SQL formatting failed: ${message}`);
    }
}
