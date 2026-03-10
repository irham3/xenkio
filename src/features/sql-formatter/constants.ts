
import { SqlLanguage, KeywordCase, IndentStyle } from './types';

export const SQL_LANGUAGES: { id: SqlLanguage; label: string }[] = [
    { id: 'sql', label: 'Standard SQL' },
    { id: 'mysql', label: 'MySQL' },
    { id: 'postgresql', label: 'PostgreSQL' },
    { id: 'sqlite', label: 'SQLite' },
    { id: 'transactsql', label: 'SQL Server (T-SQL)' },
    { id: 'plsql', label: 'Oracle PL/SQL' },
    { id: 'mariadb', label: 'MariaDB' },
    { id: 'bigquery', label: 'BigQuery' },
    { id: 'db2', label: 'IBM DB2' },
    { id: 'hive', label: 'Hive SQL' },
    { id: 'redshift', label: 'Amazon Redshift' },
    { id: 'snowflake', label: 'Snowflake' },
    { id: 'spark', label: 'Spark SQL' },
    { id: 'trino', label: 'Trino / Presto' },
];

export const KEYWORD_CASES: { id: KeywordCase; label: string }[] = [
    { id: 'upper', label: 'UPPERCASE' },
    { id: 'lower', label: 'lowercase' },
    { id: 'preserve', label: 'Preserve' },
];

export const INDENT_STYLES: { id: IndentStyle; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'tabularLeft', label: 'Tabular Left' },
    { id: 'tabularRight', label: 'Tabular Right' },
];

export const TAB_WIDTHS: { id: number; label: string }[] = [
    { id: 2, label: '2 Spaces' },
    { id: 4, label: '4 Spaces' },
];

export const SAMPLE_SQL = `select u.id, u.name, u.email, o.order_id, o.total_amount, p.product_name
from users u
inner join orders o on u.id = o.user_id
left join order_items oi on o.order_id = oi.order_id
left join products p on oi.product_id = p.id
where u.status = 'active' and o.created_at >= '2024-01-01'
and o.total_amount > 100
group by u.id, u.name, u.email, o.order_id, o.total_amount, p.product_name
having count(oi.id) > 2
order by o.total_amount desc
limit 50;`;
