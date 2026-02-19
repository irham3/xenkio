'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, History, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───
type AngleUnit = 'deg' | 'rad';
type CalcMode = 'basic' | 'scientific';

interface HistoryEntry {
    id: number;
    expression: string;
    result: string;
}

// ─── Constants ───
const MAX_HISTORY = 20;

// ─── Math Helpers ───
function toRadians(value: number, unit: AngleUnit): number {
    return unit === 'deg' ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, unit: AngleUnit): number {
    return unit === 'deg' ? (value * 180) / Math.PI : value;
}

function factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    if (!Number.isInteger(n)) return NaN;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function formatNumber(num: number): string {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
        return num.toExponential(8);
    }
    // Avoid floating point display issues
    const str = String(num);
    if (str.length > 16) {
        return parseFloat(num.toPrecision(12)).toString();
    }
    return str;
}

// ─── Evaluator ───
// Safe math expression evaluator (no eval)
function evaluateExpression(expr: string, angleUnit: AngleUnit): number {
    const tokens = tokenize(expr);
    const result = parseExpression(tokens, 0, angleUnit);
    return result.value;
}

interface ParseResult {
    value: number;
    pos: number;
}

type Token = { type: 'number'; value: number }
    | { type: 'op'; value: string }
    | { type: 'func'; value: string }
    | { type: 'paren'; value: '(' | ')' };

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const s = expr.replace(/\s+/g, '');

    while (i < s.length) {
        // Number
        if (/[0-9.]/.test(s[i]) || (s[i] === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'op' || (tokens[tokens.length - 1].type === 'paren' && tokens[tokens.length - 1].value === '(')))) {
            let num = '';
            if (s[i] === '-') { num += '-'; i++; }
            while (i < s.length && /[0-9.eE]/.test(s[i])) {
                num += s[i]; i++;
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
        }
        // Functions
        else if (/[a-zA-Zπ]/.test(s[i])) {
            let func = '';
            while (i < s.length && /[a-zA-Z0-9π]/.test(s[i])) {
                func += s[i]; i++;
            }
            // Constants
            if (func === 'pi' || func === 'π') {
                tokens.push({ type: 'number', value: Math.PI });
            } else if (func === 'e' && (i >= s.length || s[i] !== '(')) {
                tokens.push({ type: 'number', value: Math.E });
            } else {
                tokens.push({ type: 'func', value: func });
            }
        }
        // Parentheses
        else if (s[i] === '(' || s[i] === ')') {
            tokens.push({ type: 'paren', value: s[i] as '(' | ')' }); i++;
        }
        // Operators
        else if ('+-×÷*/^%'.includes(s[i])) {
            let op = s[i];
            if (op === '×') op = '*';
            if (op === '÷') op = '/';
            tokens.push({ type: 'op', value: op }); i++;
        }
        // Factorial
        else if (s[i] === '!') {
            tokens.push({ type: 'op', value: '!' }); i++;
        }
        else {
            i++; // skip unknown
        }
    }
    return tokens;
}

function parseExpression(tokens: Token[], pos: number, angleUnit: AngleUnit): ParseResult {
    let left = parseTerm(tokens, pos, angleUnit);
    while (left.pos < tokens.length) {
        const t = tokens[left.pos];
        if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
            const right = parseTerm(tokens, left.pos + 1, angleUnit);
            left = {
                value: t.value === '+' ? left.value + right.value : left.value - right.value,
                pos: right.pos,
            };
        } else break;
    }
    return left;
}

function parseTerm(tokens: Token[], pos: number, angleUnit: AngleUnit): ParseResult {
    let left = parsePower(tokens, pos, angleUnit);
    while (left.pos < tokens.length) {
        const t = tokens[left.pos];
        if (t?.type === 'op' && (t.value === '*' || t.value === '/' || t.value === '%')) {
            const right = parsePower(tokens, left.pos + 1, angleUnit);
            if (t.value === '*') left = { value: left.value * right.value, pos: right.pos };
            else if (t.value === '/') left = { value: left.value / right.value, pos: right.pos };
            else left = { value: left.value % right.value, pos: right.pos };
        } else break;
    }
    return left;
}

function parsePower(tokens: Token[], pos: number, angleUnit: AngleUnit): ParseResult {
    let base = parseUnary(tokens, pos, angleUnit);
    if (base.pos < tokens.length && tokens[base.pos]?.type === 'op' && tokens[base.pos].value === '^') {
        const exp = parsePower(tokens, base.pos + 1, angleUnit); // right-associative
        base = { value: Math.pow(base.value, exp.value), pos: exp.pos };
    }
    // Postfix factorial
    while (base.pos < tokens.length && tokens[base.pos]?.type === 'op' && tokens[base.pos].value === '!') {
        base = { value: factorial(base.value), pos: base.pos + 1 };
    }
    return base;
}

function parseUnary(tokens: Token[], pos: number, angleUnit: AngleUnit): ParseResult {
    const t = tokens[pos];
    if (!t) return { value: 0, pos };

    // Function call
    if (t.type === 'func') {
        if (pos + 1 < tokens.length && tokens[pos + 1]?.type === 'paren' && tokens[pos + 1].value === '(') {
            const inner = parseExpression(tokens, pos + 2, angleUnit);
            const nextPos = inner.pos + 1; // skip ')'
            const v = inner.value;
            const funcResult = evalFunc(t.value, v, angleUnit);
            return { value: funcResult, pos: nextPos };
        }
        // Function without parens — treat as error, return 0
        return { value: 0, pos: pos + 1 };
    }

    // Parenthesized expression
    if (t.type === 'paren' && t.value === '(') {
        const inner = parseExpression(tokens, pos + 1, angleUnit);
        return { value: inner.value, pos: inner.pos + 1 }; // skip ')'
    }

    // Number
    if (t.type === 'number') {
        return { value: t.value, pos: pos + 1 };
    }

    return { value: 0, pos: pos + 1 };
}

function evalFunc(name: string, v: number, angleUnit: AngleUnit): number {
    switch (name) {
        case 'sin': return Math.sin(toRadians(v, angleUnit));
        case 'cos': return Math.cos(toRadians(v, angleUnit));
        case 'tan': return Math.tan(toRadians(v, angleUnit));
        case 'asin': return fromRadians(Math.asin(v), angleUnit);
        case 'acos': return fromRadians(Math.acos(v), angleUnit);
        case 'atan': return fromRadians(Math.atan(v), angleUnit);
        case 'sinh': return Math.sinh(v);
        case 'cosh': return Math.cosh(v);
        case 'tanh': return Math.tanh(v);
        case 'log': return Math.log10(v);
        case 'ln': return Math.log(v);
        case 'log2': return Math.log2(v);
        case 'sqrt': case '√': return Math.sqrt(v);
        case 'cbrt': return Math.cbrt(v);
        case 'abs': return Math.abs(v);
        case 'ceil': return Math.ceil(v);
        case 'floor': return Math.floor(v);
        case 'round': return Math.round(v);
        case 'exp': return Math.exp(v);
        default: return NaN;
    }
}

// ─── Button Layout ───
interface CalcButton {
    label: string;
    action: string;
    span?: number;
    variant?: 'default' | 'op' | 'func' | 'equal' | 'clear' | 'danger';
}

const BASIC_BUTTONS: CalcButton[][] = [
    [
        { label: 'C', action: 'clear', variant: 'danger' },
        { label: '⌫', action: 'backspace', variant: 'clear' },
        { label: '%', action: 'input:%', variant: 'op' },
        { label: '÷', action: 'input:/', variant: 'op' },
    ],
    [
        { label: '7', action: 'input:7' },
        { label: '8', action: 'input:8' },
        { label: '9', action: 'input:9' },
        { label: '×', action: 'input:*', variant: 'op' },
    ],
    [
        { label: '4', action: 'input:4' },
        { label: '5', action: 'input:5' },
        { label: '6', action: 'input:6' },
        { label: '−', action: 'input:-', variant: 'op' },
    ],
    [
        { label: '1', action: 'input:1' },
        { label: '2', action: 'input:2' },
        { label: '3', action: 'input:3' },
        { label: '+', action: 'input:+', variant: 'op' },
    ],
    [
        { label: '±', action: 'negate' },
        { label: '0', action: 'input:0' },
        { label: '.', action: 'input:.' },
        { label: '=', action: 'evaluate', variant: 'equal' },
    ],
];

const SCIENTIFIC_BUTTONS: CalcButton[][] = [
    [
        { label: 'sin', action: 'func:sin', variant: 'func' },
        { label: 'cos', action: 'func:cos', variant: 'func' },
        { label: 'tan', action: 'func:tan', variant: 'func' },
        { label: 'π', action: 'const:pi', variant: 'func' },
        { label: 'e', action: 'const:e', variant: 'func' },
    ],
    [
        { label: 'sin⁻¹', action: 'func:asin', variant: 'func' },
        { label: 'cos⁻¹', action: 'func:acos', variant: 'func' },
        { label: 'tan⁻¹', action: 'func:atan', variant: 'func' },
        { label: '(', action: 'input:(', variant: 'func' },
        { label: ')', action: 'input:)', variant: 'func' },
    ],
    [
        { label: 'log', action: 'func:log', variant: 'func' },
        { label: 'ln', action: 'func:ln', variant: 'func' },
        { label: '√', action: 'func:sqrt', variant: 'func' },
        { label: 'x²', action: 'power:2', variant: 'func' },
        { label: 'xⁿ', action: 'input:^', variant: 'func' },
    ],
    [
        { label: 'sinh', action: 'func:sinh', variant: 'func' },
        { label: 'cosh', action: 'func:cosh', variant: 'func' },
        { label: 'tanh', action: 'func:tanh', variant: 'func' },
        { label: 'n!', action: 'factorial', variant: 'func' },
        { label: '|x|', action: 'func:abs', variant: 'func' },
    ],
    [
        { label: 'exp', action: 'func:exp', variant: 'func' },
        { label: '∛', action: 'func:cbrt', variant: 'func' },
        { label: '1/x', action: 'reciprocal', variant: 'func' },
        { label: 'x³', action: 'power:3', variant: 'func' },
        { label: '10ⁿ', action: 'tenpower', variant: 'func' },
    ],
];

// ─── Main Component ───
export function ScientificCalculator() {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [prevResult, setPrevResult] = useState<string | null>(null);
    const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
    const [mode, setMode] = useState<CalcMode>('scientific');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const nextId = useRef(0);
    const displayRef = useRef<HTMLDivElement>(null);

    // Auto-scroll display
    useEffect(() => {
        if (displayRef.current) {
            displayRef.current.scrollLeft = displayRef.current.scrollWidth;
        }
    }, [display]);

    const handleCopy = useCallback((text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    }, []);

    const handleAction = useCallback((action: string) => {
        if (action === 'clear') {
            setDisplay('0');
            setExpression('');
            setPrevResult(null);
            setHasError(false);
            return;
        }

        if (action === 'backspace') {
            if (hasError) { setDisplay('0'); setHasError(false); return; }
            setDisplay(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));
            return;
        }

        if (action === 'evaluate') {
            try {
                const expr = display
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/−/g, '-');
                const result = evaluateExpression(expr, angleUnit);
                const formatted = formatNumber(result);
                const entry: HistoryEntry = {
                    id: nextId.current++,
                    expression: display,
                    result: formatted,
                };
                setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
                setExpression(display);
                setDisplay(formatted);
                setPrevResult(formatted);
                setHasError(formatted === 'Error');
            } catch {
                setDisplay('Error');
                setHasError(true);
            }
            return;
        }

        if (action === 'negate') {
            setDisplay(prev => {
                if (prev === '0' || prev === 'Error') return prev;
                return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
            });
            return;
        }

        if (action === 'factorial') {
            try {
                const num = parseFloat(display);
                const result = factorial(num);
                const formatted = formatNumber(result);
                setExpression(display + '!');
                setDisplay(formatted);
                setPrevResult(formatted);
            } catch {
                setDisplay('Error');
                setHasError(true);
            }
            return;
        }

        if (action === 'reciprocal') {
            try {
                const num = parseFloat(display);
                const result = 1 / num;
                const formatted = formatNumber(result);
                setExpression('1/(' + display + ')');
                setDisplay(formatted);
                setPrevResult(formatted);
            } catch {
                setDisplay('Error');
                setHasError(true);
            }
            return;
        }

        if (action === 'tenpower') {
            try {
                const num = parseFloat(display);
                const result = Math.pow(10, num);
                const formatted = formatNumber(result);
                setExpression('10^(' + display + ')');
                setDisplay(formatted);
                setPrevResult(formatted);
            } catch {
                setDisplay('Error');
                setHasError(true);
            }
            return;
        }

        if (action.startsWith('power:')) {
            const pow = action.split(':')[1];
            try {
                const num = parseFloat(display);
                const result = Math.pow(num, parseFloat(pow));
                const formatted = formatNumber(result);
                setExpression(display + '^' + pow);
                setDisplay(formatted);
                setPrevResult(formatted);
            } catch {
                setDisplay('Error');
                setHasError(true);
            }
            return;
        }

        if (action.startsWith('func:')) {
            const func = action.split(':')[1];
            const currentDisplay = hasError ? '0' : display;
            const num = parseFloat(currentDisplay);

            // If display is a valid number, apply the function immediately
            if (!isNaN(num) && currentDisplay !== '' && !/[a-zA-Z(]/.test(currentDisplay)) {
                try {
                    const result = evalFunc(func, num, angleUnit);
                    const formatted = formatNumber(result);
                    setExpression(func + '(' + currentDisplay + ')');
                    setDisplay(formatted);
                    setPrevResult(formatted);
                    setHasError(false);
                } catch {
                    setDisplay('Error');
                    setHasError(true);
                }
            } else {
                // Display contains an expression or is empty — insert function text
                if (currentDisplay === '0' || hasError) {
                    setDisplay(func + '(');
                } else {
                    setDisplay(prev => prev + func + '(');
                }
                setPrevResult(null);
                setHasError(false);
            }
            return;
        }

        if (action.startsWith('const:')) {
            const c = action.split(':')[1];
            const val = c === 'pi' ? formatNumber(Math.PI) : formatNumber(Math.E);
            if (display === '0' || prevResult !== null || hasError) {
                setDisplay(val);
            } else {
                setDisplay(prev => prev + val);
            }
            setPrevResult(null);
            setHasError(false);
            return;
        }

        if (action.startsWith('input:')) {
            const char = action.split(':')[1];
            const isOperator = '+-*/%^'.includes(char);

            if (hasError && !isOperator) {
                setDisplay(char);
                setHasError(false);
                setPrevResult(null);
                return;
            }

            if (prevResult !== null && !isOperator && char !== '(' && char !== ')') {
                setDisplay(char);
                setPrevResult(null);
                return;
            }

            if (prevResult !== null && isOperator) {
                setPrevResult(null);
            }

            setDisplay(prev => {
                if (prev === '0' && !isOperator && char !== '.' && char !== '(' && char !== ')') {
                    return char;
                }
                return prev + char;
            });
            setHasError(false);
            return;
        }
    }, [display, angleUnit, prevResult, hasError]);

    // Keyboard support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            e.preventDefault();

            if (e.key === 'Enter' || e.key === '=') handleAction('evaluate');
            else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') handleAction('clear');
            else if (e.key === 'Backspace' || e.key === 'Delete') handleAction('backspace');
            else if ('0123456789'.includes(e.key)) handleAction('input:' + e.key);
            else if (e.key === '+') handleAction('input:+');
            else if (e.key === '-') handleAction('input:-');
            else if (e.key === '*') handleAction('input:*');
            else if (e.key === '/') handleAction('input:/');
            else if (e.key === '.') handleAction('input:.');
            else if (e.key === '(' || e.key === ')') handleAction('input:' + e.key);
            else if (e.key === '^') handleAction('input:^');
            else if (e.key === '%') handleAction('input:%');
            else if (e.key === '!') handleAction('factorial');
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleAction]);

    const onHistoryClick = useCallback((entry: HistoryEntry) => {
        setDisplay(entry.result);
        setExpression(entry.expression);
        setPrevResult(entry.result);
        setHasError(false);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-start justify-center gap-5">
                {/* Calculator Body */}
                <div className="w-full max-w-xl space-y-3">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {/* Mode & Angle Toggle */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
                            <div className="flex items-center gap-1.5">
                                {(['basic', 'scientific'] as CalcMode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={cn(
                                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                                            mode === m
                                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                                : 'text-gray-400 hover:text-gray-600'
                                        )}
                                    >
                                        {m === 'basic' ? 'Basic' : 'Scientific'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                {mode === 'scientific' && (
                                    <div className="flex items-center gap-1.5">
                                        {(['deg', 'rad'] as AngleUnit[]).map((u) => (
                                            <button
                                                key={u}
                                                onClick={() => setAngleUnit(u)}
                                                className={cn(
                                                    'px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-all',
                                                    angleUnit === u
                                                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                )}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* History Toggle — always visible */}
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={cn(
                                        'relative p-1.5 rounded-lg transition-all',
                                        showHistory
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    )}
                                    title="Toggle history"
                                >
                                    <History className="w-4 h-4" />
                                    {history.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                            {history.length > 9 ? '9+' : history.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Display */}
                        <div className="px-5 pt-5 pb-4">
                            {expression && (
                                <div className="text-right text-sm text-gray-400 mb-1 truncate font-mono h-5">
                                    {expression} =
                                </div>
                            )}
                            <div className="flex items-end justify-between gap-3">
                                <div
                                    ref={displayRef}
                                    className={cn(
                                        'flex-1 text-right font-semibold tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none font-mono',
                                        display.length > 14 ? 'text-2xl' : display.length > 10 ? 'text-3xl' : 'text-4xl',
                                        hasError ? 'text-red-500' : 'text-gray-900'
                                    )}
                                >
                                    {display}
                                </div>
                                <button
                                    onClick={() => handleCopy(display, 'display')}
                                    className={cn(
                                        'p-1.5 rounded-lg transition-all shrink-0 mb-1',
                                        copiedField === 'display'
                                            ? 'text-emerald-500 bg-emerald-50'
                                            : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                                    )}
                                    title="Copy result"
                                >
                                    {copiedField === 'display' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Scientific Buttons */}
                        {mode === 'scientific' && (
                            <div className="px-3 pb-2 space-y-1.5">
                                {SCIENTIFIC_BUTTONS.map((row, ri) => (
                                    <div key={ri} className="grid grid-cols-5 gap-1.5">
                                        {row.map((btn) => (
                                            <CalcBtn key={btn.label} btn={btn} onAction={handleAction} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="mx-3 border-t border-gray-100" />

                        {/* Basic Buttons */}
                        <div className="p-3 space-y-1.5">
                            {BASIC_BUTTONS.map((row, ri) => (
                                <div key={ri} className="grid grid-cols-4 gap-1.5">
                                    {row.map((btn) => (
                                        <CalcBtn key={btn.label} btn={btn} onAction={handleAction} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Keyboard Shortcut Hint */}
                    <p className="text-center text-[11px] text-gray-300">
                        Use your keyboard for faster input · Enter to calculate · Esc to clear
                    </p>
                </div>

                {/* History Sidebar — Desktop */}
                <div
                    className={cn(
                        'hidden lg:block transition-all duration-300 ease-in-out overflow-hidden shrink-0',
                        showHistory ? 'w-72 opacity-100' : 'w-0 opacity-0'
                    )}
                >
                    <div className="w-72 sticky top-24 max-h-[calc(100vh-8rem)]">
                        <HistorySidebar
                            history={history}
                            copiedField={copiedField}
                            onHistoryClick={onHistoryClick}
                            onCopy={handleCopy}
                            onClear={() => setHistory([])}
                            onClose={() => setShowHistory(false)}
                        />
                    </div>
                </div>
            </div>

            {/* History Sidebar — Mobile overlay */}
            {showHistory && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setShowHistory(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-right duration-200">
                        <HistorySidebar
                            history={history}
                            copiedField={copiedField}
                            onHistoryClick={(entry) => { onHistoryClick(entry); setShowHistory(false); }}
                            onCopy={handleCopy}
                            onClear={() => setHistory([])}
                            onClose={() => setShowHistory(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Button Component ───
function CalcBtn({ btn, onAction }: { btn: CalcButton; onAction: (action: string) => void }) {
    const baseStyles = 'flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.96] select-none';

    const variantStyles = {
        default: 'bg-gray-50 hover:bg-gray-100 text-gray-800 text-lg h-14',
        op: 'bg-primary-50 hover:bg-primary-100 text-primary-700 text-lg font-semibold h-14',
        func: 'bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold h-11',
        equal: 'bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold h-14 shadow-sm',
        clear: 'bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg h-14',
        danger: 'bg-red-50 hover:bg-red-100 text-red-500 text-sm font-bold h-14',
    };

    return (
        <button
            onClick={() => onAction(btn.action)}
            className={cn(
                baseStyles,
                variantStyles[btn.variant || 'default'],
                btn.span && `col-span-${btn.span}`
            )}
        >
            {btn.label}
        </button>
    );
}

// ─── History Sidebar ───
function HistorySidebar({
    history,
    copiedField,
    onHistoryClick,
    onCopy,
    onClear,
    onClose,
}: {
    history: HistoryEntry[];
    copiedField: string | null;
    onHistoryClick: (entry: HistoryEntry) => void;
    onCopy: (text: string, field: string) => void;
    onClear: () => void;
    onClose: () => void;
}) {
    return (
        <div className="h-full flex flex-col bg-white rounded-2xl lg:border lg:border-gray-200 lg:shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 shrink-0">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">History</span>
                    {history.length > 0 && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {history.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <History className="w-8 h-8 text-gray-200 mb-2" />
                        <p className="text-xs text-gray-400">No calculations yet</p>
                    </div>
                ) : (
                    history.map((entry) => (
                        <div
                            key={entry.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onHistoryClick(entry)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onHistoryClick(entry); }}
                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left group cursor-pointer"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-gray-400 truncate font-mono">{entry.expression}</p>
                                <p className="text-sm font-semibold text-gray-900 font-mono">= {entry.result}</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopy(entry.result, 'h-' + entry.id);
                                }}
                                className={cn(
                                    'p-1 rounded-md transition-all shrink-0 ml-1.5',
                                    copiedField === 'h-' + entry.id
                                        ? 'text-emerald-500 bg-emerald-50'
                                        : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500'
                                )}
                            >
                                {copiedField === 'h-' + entry.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
                <div className="px-3 py-2.5 border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClear}
                        className="w-full flex items-center justify-center gap-1.5 p-2 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear history
                    </button>
                </div>
            )}
        </div>
    );
}
