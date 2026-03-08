
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
    return format(sql, {
        language,
        tabWidth,
        useTabs,
        keywordCase,
        indentStyle,
    });
}
