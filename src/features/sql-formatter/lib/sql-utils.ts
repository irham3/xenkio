import { SqlKeywordCase } from '../types';

// ---------------------------------------------------------------------------
// Tokeniser
// ---------------------------------------------------------------------------

type TokenType =
    | 'keyword'
    | 'identifier'
    | 'string'
    | 'number'
    | 'operator'
    | 'comma'
    | 'semicolon'
    | 'lparen'
    | 'rparen'
    | 'line_comment'
    | 'block_comment'
    | 'dot'
    | 'other';

interface Token {
    type: TokenType;
    value: string;
}

const SQL_KEYWORDS = new Set<string>([
    'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'AUTO_INCREMENT', 'AUTOINCREMENT',
    'BEGIN', 'BETWEEN', 'BY',
    'CASE', 'CHECK', 'COLUMN', 'COMMIT', 'CONSTRAINT', 'CREATE', 'CROSS',
    'DATABASE', 'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP',
    'ELSE', 'END', 'EXCEPT', 'EXISTS', 'EXPLAIN',
    'FALSE', 'FETCH', 'FOLLOWING', 'FOR', 'FOREIGN', 'FROM', 'FULL',
    'GROUP', 'HAVING',
    'IF', 'ILIKE', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTERSECT', 'INTO', 'IS',
    'JOIN', 'KEY',
    'LEFT', 'LIKE', 'LIMIT',
    'MERGE', 'NATURAL', 'NOT', 'NULL', 'NULLS',
    'OFFSET', 'ON', 'OR', 'ORDER', 'OUTER', 'OVER',
    'PARTITION', 'PRECEDING', 'PRIMARY',
    'RECURSIVE', 'REFERENCES', 'REPLACE', 'RETURNING', 'RIGHT', 'ROLLBACK', 'ROW', 'ROWS',
    'SELECT', 'SET',
    'TABLE', 'THEN', 'TOP', 'TRUE', 'TRANSACTION',
    'UNBOUNDED', 'UNION', 'UNIQUE', 'UNKNOWN', 'UPDATE', 'USING',
    'VALUES', 'VIEW',
    'WHEN', 'WHERE', 'WITH', 'WINDOW',
]);

function tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < sql.length) {
        const ch = sql[i];

        // Whitespace – discard (formatter reconstructs spacing)
        if (/\s/.test(ch)) { i++; continue; }

        // Line comment  --
        if (ch === '-' && sql[i + 1] === '-') {
            let v = '';
            while (i < sql.length && sql[i] !== '\n') v += sql[i++];
            tokens.push({ type: 'line_comment', value: v });
            continue;
        }

        // Block comment  /* ... */
        if (ch === '/' && sql[i + 1] === '*') {
            let v = '/*'; i += 2;
            while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) v += sql[i++];
            v += '*/'; i += 2;
            tokens.push({ type: 'block_comment', value: v });
            continue;
        }

        // Single-quoted string  '...'
        if (ch === "'") {
            let v = "'"; i++;
            while (i < sql.length) {
                if (sql[i] === "'" && sql[i + 1] === "'") { v += "''"; i += 2; }
                else if (sql[i] === "'") { v += "'"; i++; break; }
                else v += sql[i++];
            }
            tokens.push({ type: 'string', value: v });
            continue;
        }

        // Double-quoted identifier  "..."
        if (ch === '"') {
            let v = '"'; i++;
            while (i < sql.length) {
                if (sql[i] === '"' && sql[i + 1] === '"') { v += '""'; i += 2; }
                else if (sql[i] === '"') { v += '"'; i++; break; }
                else v += sql[i++];
            }
            tokens.push({ type: 'identifier', value: v });
            continue;
        }

        // Backtick identifier  `...`  (MySQL)
        if (ch === '`') {
            let v = '`'; i++;
            while (i < sql.length && sql[i] !== '`') v += sql[i++];
            v += '`'; i++;
            tokens.push({ type: 'identifier', value: v });
            continue;
        }

        // Square-bracket identifier  [...]  (SQL Server)
        if (ch === '[') {
            let v = '['; i++;
            while (i < sql.length && sql[i] !== ']') v += sql[i++];
            v += ']'; i++;
            tokens.push({ type: 'identifier', value: v });
            continue;
        }

        // Numeric literal
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(sql[i + 1] ?? ''))) {
            let v = '';
            while (i < sql.length && /[0-9._eExX]/.test(sql[i])) v += sql[i++];
            tokens.push({ type: 'number', value: v });
            continue;
        }

        // Single-character punctuation
        if (ch === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
        if (ch === ';') { tokens.push({ type: 'semicolon', value: ';' }); i++; continue; }
        if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
        if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
        if (ch === '.') { tokens.push({ type: 'dot', value: '.' }); i++; continue; }

        // Operators  = <> >= != || :: etc.
        if (/[+\-*/<>=!|^%&~@#]/.test(ch)) {
            let v = '';
            while (i < sql.length && /[+\-*/<>=!|^%&~@#]/.test(sql[i])) v += sql[i++];
            tokens.push({ type: 'operator', value: v });
            continue;
        }

        // Word – keyword or identifier
        if (/[a-zA-Z_$]/.test(ch)) {
            let v = '';
            while (i < sql.length && /[a-zA-Z0-9_$]/.test(sql[i])) v += sql[i++];
            const upper = v.toUpperCase();
            tokens.push({ type: SQL_KEYWORDS.has(upper) ? 'keyword' : 'identifier', value: v });
            continue;
        }

        // Anything else (e.g. ?, $1 placeholders without the word part)
        tokens.push({ type: 'other', value: ch }); i++;
    }

    return tokens;
}

// ---------------------------------------------------------------------------
// Multi-word keyword merger
// ---------------------------------------------------------------------------

// Order matters: longest patterns first so they match before shorter ones
const MULTI_WORD_KEYWORDS: string[][] = [
    ['IS', 'NOT', 'NULL'],
    ['LEFT', 'OUTER', 'JOIN'],
    ['RIGHT', 'OUTER', 'JOIN'],
    ['FULL', 'OUTER', 'JOIN'],
    ['GROUP', 'BY'],
    ['ORDER', 'BY'],
    ['PARTITION', 'BY'],
    ['INNER', 'JOIN'],
    ['LEFT', 'JOIN'],
    ['RIGHT', 'JOIN'],
    ['FULL', 'JOIN'],
    ['CROSS', 'JOIN'],
    ['NATURAL', 'JOIN'],
    ['UNION', 'ALL'],
    ['INTERSECT', 'ALL'],
    ['EXCEPT', 'ALL'],
    ['NOT', 'IN'],
    ['NOT', 'LIKE'],
    ['NOT', 'ILIKE'],
    ['NOT', 'EXISTS'],
    ['NOT', 'BETWEEN'],
    ['IS', 'NOT'],
    ['IS', 'NULL'],
    ['INSERT', 'INTO'],
    ['DELETE', 'FROM'],
];

function mergeKeywords(tokens: Token[]): Token[] {
    const result: Token[] = [];
    let i = 0;

    while (i < tokens.length) {
        let merged = false;

        for (const words of MULTI_WORD_KEYWORDS) {
            if (i + words.length > tokens.length) continue;

            const matches = words.every(
                (word, j) =>
                    tokens[i + j].type === 'keyword' &&
                    tokens[i + j].value.toUpperCase() === word
            );

            if (matches) {
                result.push({
                    type: 'keyword',
                    value: tokens.slice(i, i + words.length).map(t => t.value).join(' '),
                });
                i += words.length;
                merged = true;
                break;
            }
        }

        if (!merged) result.push(tokens[i++]);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Formatter helpers
// ---------------------------------------------------------------------------

function applyCase(value: string, kcase: SqlKeywordCase): string {
    if (kcase === 'upper') return value.toUpperCase();
    if (kcase === 'lower') return value.toLowerCase();
    // 'preserve' – keep the first word's original casing for each part
    return value;
}

// Clause keywords that each start on their own line
const CLAUSE_KEYWORDS = new Set<string>([
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
    'UNION', 'UNION ALL', 'INTERSECT', 'INTERSECT ALL', 'EXCEPT', 'EXCEPT ALL',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'NATURAL JOIN',
    'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'JOIN',
    'ON',
    'INSERT INTO', 'VALUES', 'UPDATE', 'DELETE FROM', 'SET',
    'WITH',
]);

// After these clause keywords each comma causes a new indented line
const COMMA_NEWLINE_CLAUSES = new Set<string>([
    'SELECT', 'GROUP BY', 'ORDER BY', 'VALUES', 'SET',
]);

// These keywords start a subquery when they immediately follow a '('
const SUBQUERY_START = new Set<string>(['SELECT', 'WITH']);

type ParenKind = 'subquery' | 'function';

interface ParenCtx {
    kind: ParenKind;
    clause: string; // clause active when the paren was opened (for restoration)
}

// ---------------------------------------------------------------------------
// Public: formatSql
// ---------------------------------------------------------------------------

export function formatSql(
    sql: string,
    options: {
        keywordCase: SqlKeywordCase;
        indentType: 'SPACE' | 'TAB';
        indentSize: number;
    }
): string {
    if (!sql.trim()) return '';

    const tokens = mergeKeywords(tokenize(sql));
    const indentStr = options.indentType === 'TAB' ? '\t' : ' '.repeat(options.indentSize);

    const lines: string[] = [];
    let currentLine = '';
    let indentLevel = 0;
    const parenStack: ParenCtx[] = [];
    let currentClause = '';

    // ── helpers ──────────────────────────────────────────────────────────────

    const getIndent = (level: number) => indentStr.repeat(Math.max(0, level));

    const flushLine = () => {
        const trimmed = currentLine.trimEnd();
        if (trimmed) lines.push(trimmed);
        currentLine = '';
    };

    const startNewLine = (level: number) => {
        flushLine();
        currentLine = getIndent(level);
    };

    // Append text to the current line, optionally preceded by a space
    const append = (text: string, needSpace = true) => {
        if (
            needSpace &&
            currentLine.length > 0 &&
            !currentLine.endsWith(' ') &&
            !currentLine.endsWith('(') &&
            !currentLine.endsWith('.')
        ) {
            currentLine += ' ';
        }
        currentLine += text;
    };

    // True when the innermost paren context is a function call (not subquery)
    const inFunctionCall = (): boolean => {
        for (let j = parenStack.length - 1; j >= 0; j--) {
            if (parenStack[j].kind === 'function') return true;
            if (parenStack[j].kind === 'subquery') return false;
        }
        return false;
    };

    // Find the next token that is not a comment
    const nextMeaningful = (from: number): Token | null => {
        for (let j = from; j < tokens.length; j++) {
            const t = tokens[j];
            if (t.type !== 'line_comment' && t.type !== 'block_comment') return t;
        }
        return null;
    };

    // ── main loop ─────────────────────────────────────────────────────────────

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const upper = token.value.toUpperCase();

        // ── comments ──────────────────────────────────────────────────────────
        if (token.type === 'line_comment') {
            flushLine();
            lines.push(getIndent(indentLevel) + token.value);
            currentLine = getIndent(indentLevel);
            continue;
        }
        if (token.type === 'block_comment') {
            append(token.value);
            continue;
        }

        // ── clause keywords ───────────────────────────────────────────────────
        if (token.type === 'keyword' && CLAUSE_KEYWORDS.has(upper)) {
            // ON belongs to JOIN – indent it one extra level for readability
            const effectiveIndent = upper === 'ON' ? indentLevel + 1 : indentLevel;
            startNewLine(effectiveIndent);
            currentLine += applyCase(token.value, options.keywordCase);
            currentClause = upper;

            if (COMMA_NEWLINE_CLAUSES.has(upper)) {
                // Items after this clause go on their own indented lines
                flushLine();
                currentLine = getIndent(indentLevel + 1);
            } else {
                currentLine += ' ';
            }
            continue;
        }

        // ── AND / OR ──────────────────────────────────────────────────────────
        // Place AND/OR on their own line unless we're inside a function call
        if (token.type === 'keyword' && (upper === 'AND' || upper === 'OR')) {
            if (!inFunctionCall()) {
                startNewLine(indentLevel + 1);
                currentLine += applyCase(token.value, options.keywordCase) + ' ';
                continue;
            }
        }

        // ── CASE / WHEN / THEN / ELSE / END ───────────────────────────────────
        // Keep CASE expressions inline to avoid complex indent tracking.
        // WHEN/THEN/ELSE/END are treated as regular keywords with a forced newline.
        if (token.type === 'keyword' && upper === 'CASE') {
            append(applyCase(token.value, options.keywordCase));
            continue;
        }
        if (token.type === 'keyword' && (upper === 'WHEN' || upper === 'ELSE' || upper === 'THEN' || upper === 'END')) {
            append(applyCase(token.value, options.keywordCase));
            continue;
        }

        // ── opening parenthesis ───────────────────────────────────────────────
        if (token.type === 'lparen') {
            const next = nextMeaningful(i + 1);
            const isSubquery =
                next !== null &&
                next.type === 'keyword' &&
                SUBQUERY_START.has(next.value.toUpperCase());

            parenStack.push({ kind: isSubquery ? 'subquery' : 'function', clause: currentClause });

            if (isSubquery) {
                // Emit space + '(' then indent the subquery body
                if (currentLine.length > 0 && !currentLine.endsWith(' ') && !currentLine.endsWith('(')) {
                    currentLine += ' ';
                }
                currentLine += '(';
                indentLevel++;
                flushLine();
                currentLine = getIndent(indentLevel);
            } else {
                // Function call or list paren – no space before '(' after an identifier
                const lastCh = currentLine[currentLine.length - 1];
                const noSpaceBefore = lastCh && /[a-zA-Z0-9_$\]`'"*]/.test(lastCh);
                if (!noSpaceBefore && currentLine.length > 0 && !currentLine.endsWith(' ')) {
                    currentLine += ' ';
                }
                currentLine += '(';
            }
            continue;
        }

        // ── closing parenthesis ───────────────────────────────────────────────
        if (token.type === 'rparen') {
            const ctx = parenStack.pop();

            if (ctx?.kind === 'subquery') {
                indentLevel = Math.max(0, indentLevel - 1);
                startNewLine(indentLevel);
                currentLine += ')';
                currentClause = ctx.clause;
            } else {
                // Trim trailing space that may have been added by commas
                currentLine = currentLine.trimEnd();
                currentLine += ')';
            }
            continue;
        }

        // ── comma ─────────────────────────────────────────────────────────────
        if (token.type === 'comma') {
            currentLine = currentLine.trimEnd();
            currentLine += ',';

            // Only add a new line when in a "comma-newline" clause AND not inside a function
            const shouldNewline = !inFunctionCall() && COMMA_NEWLINE_CLAUSES.has(currentClause);
            if (shouldNewline) {
                flushLine();
                currentLine = getIndent(indentLevel + 1);
            } else {
                currentLine += ' ';
            }
            continue;
        }

        // ── semicolon ─────────────────────────────────────────────────────────
        if (token.type === 'semicolon') {
            currentLine = currentLine.trimEnd();
            currentLine += ';';
            flushLine();
            lines.push(''); // blank line between statements
            indentLevel = 0;
            currentClause = '';
            continue;
        }

        // ── dot ───────────────────────────────────────────────────────────────
        if (token.type === 'dot') {
            currentLine = currentLine.trimEnd();
            currentLine += '.';
            continue;
        }

        // ── operators ─────────────────────────────────────────────────────────
        if (token.type === 'operator') {
            // Ensure exactly one space before the operator
            if (currentLine.length > 0 && !currentLine.endsWith(' ') && !currentLine.endsWith('(')) {
                currentLine += ' ';
            }
            currentLine += token.value + ' ';
            continue;
        }

        // ── default: identifier, string, number, keyword (non-clause), other ──
        const text =
            token.type === 'keyword'
                ? applyCase(token.value, options.keywordCase)
                : token.value;
        append(text);
    }

    flushLine();

    // Strip surrounding blank lines
    while (lines.length > 0 && !lines[0].trim()) lines.shift();
    while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();

    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public: minifySql
// ---------------------------------------------------------------------------

export function minifySql(sql: string): string {
    if (!sql.trim()) return '';

    const tokens = tokenize(sql);
    let result = '';

    for (const token of tokens) {
        // Drop all comments
        if (token.type === 'line_comment' || token.type === 'block_comment') continue;

        // These attach to the previous token without a leading space
        if (token.type === 'dot') {
            result = result.trimEnd();
            result += '.';
            continue;
        }
        if (token.type === 'lparen') {
            result = result.trimEnd();
            result += '(';
            continue;
        }
        if (token.type === 'rparen') {
            result = result.trimEnd();
            result += ')';
            continue;
        }
        if (token.type === 'comma') {
            result = result.trimEnd();
            result += ', ';
            continue;
        }
        if (token.type === 'semicolon') {
            result = result.trimEnd();
            result += '; ';
            continue;
        }

        // Operators: space on both sides
        if (token.type === 'operator') {
            result = result.trimEnd();
            result += ' ' + token.value + ' ';
            continue;
        }

        // Default: append with a space separator
        if (result.length > 0 && !result.endsWith(' ')) result += ' ';
        result += token.value;
    }

    return result.trim();
}

// ---------------------------------------------------------------------------
// Public: validateSql (basic structural check)
// ---------------------------------------------------------------------------

export function validateSql(sql: string): { isValid: boolean; error?: string } {
    if (!sql.trim()) return { isValid: false, error: 'SQL input is empty' };

    const tokens = tokenize(sql);

    // Balance parentheses
    let depth = 0;
    for (const token of tokens) {
        if (token.type === 'lparen') depth++;
        else if (token.type === 'rparen') {
            depth--;
            if (depth < 0) return { isValid: false, error: 'Unexpected closing parenthesis )' };
        }
    }
    if (depth > 0) return { isValid: false, error: `Unclosed parenthesis – ${depth} opening paren(s) without matching )` };

    // Check for at least one meaningful keyword
    const meaningful = tokens.filter(
        t => t.type !== 'line_comment' && t.type !== 'block_comment'
    );
    if (meaningful.length === 0) return { isValid: false, error: 'No SQL tokens found' };

    return { isValid: true };
}

// ---------------------------------------------------------------------------
// Samples
// ---------------------------------------------------------------------------

export const SAMPLE_SQL = `SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS order_count
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE
    u.status = 'active'
    AND o.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC
LIMIT 20;`;
