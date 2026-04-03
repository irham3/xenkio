'use client';

import { useState, useCallback } from 'react';
import { Info, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type BigO =
    | 'O(1)'
    | 'O(log n)'
    | 'O(n)'
    | 'O(n log n)'
    | 'O(n²)'
    | 'O(n³)'
    | 'O(2ⁿ)'
    | 'O(n!)'
    | 'Unknown';

interface ComplexityResult {
    time: BigO;
    space: BigO;
    explanation: string[];
    loopDepth: number;
    hasRecursion: boolean;
    hasDivideAndConquer: boolean;
    hasFactorial: boolean;
}

interface ComplexityEntry {
    notation: BigO;
    name: string;
    example: string;
    color: string;
    rating: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COMPLEXITY_TABLE: ComplexityEntry[] = [
    { notation: 'O(1)', name: 'Constant', example: 'Array access, hash lookup', color: 'bg-green-100 text-green-800', rating: 'Excellent' },
    { notation: 'O(log n)', name: 'Logarithmic', example: 'Binary search, balanced BST', color: 'bg-emerald-100 text-emerald-800', rating: 'Good' },
    { notation: 'O(n)', name: 'Linear', example: 'Linear search, single loop', color: 'bg-blue-100 text-blue-800', rating: 'Fair' },
    { notation: 'O(n log n)', name: 'Linearithmic', example: 'Merge sort, heap sort', color: 'bg-yellow-100 text-yellow-800', rating: 'Acceptable' },
    { notation: 'O(n²)', name: 'Quadratic', example: 'Bubble sort, nested loops', color: 'bg-orange-100 text-orange-800', rating: 'Poor' },
    { notation: 'O(n³)', name: 'Cubic', example: 'Triple nested loops, naive matrix mult.', color: 'bg-red-100 text-red-800', rating: 'Bad' },
    { notation: 'O(2ⁿ)', name: 'Exponential', example: 'Recursive Fibonacci, power set', color: 'bg-red-200 text-red-900', rating: 'Terrible' },
    { notation: 'O(n!)', name: 'Factorial', example: 'Permutations, travelling salesman (brute)', color: 'bg-red-300 text-red-950', rating: 'Worst' },
];

const ORDER: BigO[] = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)'];

const COMMON_PATTERNS = [
    {
        label: 'Single loop (O(n))',
        code: `for (let i = 0; i < n; i++) {\n  // do work\n}`,
    },
    {
        label: 'Nested loops (O(n²))',
        code: `for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    // do work\n  }\n}`,
    },
    {
        label: 'Binary search (O(log n))',
        code: `function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}`,
    },
    {
        label: 'Merge sort (O(n log n))',
        code: `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}`,
    },
    {
        label: 'Recursive Fibonacci (O(2ⁿ))',
        code: `function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}`,
    },
    {
        label: 'Permutations (O(n!))',
        code: `function permute(arr, current = []) {\n  if (arr.length === 0) { results.push(current); return; }\n  for (let i = 0; i < arr.length; i++) {\n    permute(\n      [...arr.slice(0, i), ...arr.slice(i + 1)],\n      [...current, arr[i]]\n    );\n  }\n}`,
    },
];

// ─── Analyzer ────────────────────────────────────────────────────────────────

/**
 * Static heuristic analysis of pseudocode / code snippets.
 * Not a full parser — covers common educational patterns.
 */
function analyzeCode(code: string): ComplexityResult {
    const lines = code.split('\n').map((l) => l.trim().toLowerCase());
    const explanations: string[] = [];

    // Detect recursion
    const fnMatch = code.match(/function\s+(\w+)/);
    const fnName = fnMatch ? fnMatch[1].toLowerCase() : null;
    const hasRecursion =
        fnName !== null && lines.some((l) => l.includes(`${fnName}(`) && !l.startsWith('function'));

    // Detect divide-and-conquer: recursive calls AND halving (mid / 2 or lo+hi/2 etc.)
    const hasHalving = lines.some(
        (l) =>
            l.includes('/ 2') ||
            l.includes('/2') ||
            l.includes('>> 1') ||
            l.includes('math.floor') ||
            l.includes('mid')
    );
    const hasDivideAndConquer = hasRecursion && hasHalving;

    // Detect factorial pattern: recursion where argument decreases AND is used in a loop, or permutation-like
    const hasPermutationKeyword = lines.some(
        (l) =>
            l.includes('permut') ||
            l.includes('factorial') ||
            l.includes('n!') ||
            l.includes('arr.length') && l.includes('slice') && hasRecursion
    );
    const hasFactorial = hasPermutationKeyword;

    // Count loop depth
    let maxDepth = 0;
    let currentDepth = 0;
    const loopKeywords = ['for ', 'while ', 'for(', 'while(', 'do {', 'do{'];

    for (const line of lines) {
        if (loopKeywords.some((k) => line.startsWith(k) || line.includes(` ${k.trim()}`))) {
            currentDepth++;
            if (currentDepth > maxDepth) maxDepth = currentDepth;
        }
        // rough depth tracking via braces
        const opens = (line.match(/\{/g) || []).length;
        const closes = (line.match(/\}/g) || []).length;
        if (closes > opens) {
            currentDepth = Math.max(0, currentDepth - (closes - opens));
        }

    }

    // Detect log-factor: while loop that halves (binary search pattern without recursion)
    const hasWhileHalving = lines.some(
        (l) =>
            (l.includes('while') || l.includes('for')) &&
            (l.includes('/ 2') || l.includes('/2') || l.includes('>> 1') || l.includes('mid'))
    );
    const hasLogFactor = hasWhileHalving || hasDivideAndConquer;

    // ── Determine time complexity ──
    let time: BigO;

    if (hasFactorial) {
        time = 'O(n!)';
        explanations.push('Detected permutation / factorial pattern → O(n!)');
    } else if (hasRecursion && !hasDivideAndConquer && maxDepth === 0) {
        // Two recursive calls (e.g. Fibonacci) → exponential
        const recursiveCalls = lines.filter(
            (l) => fnName && l.includes(`${fnName}(`) && !l.startsWith('function')
        ).length;
        if (recursiveCalls >= 2) {
            time = 'O(2ⁿ)';
            explanations.push('Detected two recursive calls without memoization → O(2ⁿ)');
        } else {
            time = 'O(n)';
            explanations.push('Detected single linear recursion → O(n)');
        }
    } else if (hasLogFactor && maxDepth <= 1) {
        if (hasDivideAndConquer && maxDepth >= 1) {
            time = 'O(n log n)';
            explanations.push('Detected divide-and-conquer with iteration → O(n log n)');
        } else {
            time = 'O(log n)';
            explanations.push('Detected halving pattern (binary search / divide-and-conquer) → O(log n)');
        }
    } else if (maxDepth === 0 && !hasRecursion) {
        time = 'O(1)';
        explanations.push('No loops or recursion detected → O(1)');
    } else if (maxDepth === 1) {
        if (hasLogFactor) {
            time = 'O(n log n)';
            explanations.push('Single loop with inner halving pattern → O(n log n)');
        } else {
            time = 'O(n)';
            explanations.push('Single loop detected → O(n)');
        }
    } else if (maxDepth === 2) {
        time = 'O(n²)';
        explanations.push('Two nested loops detected → O(n²)');
    } else if (maxDepth >= 3) {
        time = 'O(n³)';
        explanations.push(`${maxDepth} nested loops detected → O(n³) or higher`);
    } else {
        time = 'Unknown';
        explanations.push('Could not determine complexity from the provided code.');
    }

    // ── Determine space complexity ──
    let space: BigO;
    const usesAuxArray = lines.some(
        (l) =>
            l.includes('new array') ||
            l.includes('= []') ||
            l.includes('= new array') ||
            l.includes('.slice(') ||
            (l.includes('[]') && !l.includes('length'))
    );

    if (hasFactorial) {
        space = 'O(n!)';
        explanations.push('Factorial recursion stack → O(n!) space');
    } else if (hasRecursion) {
        space = 'O(n)';
        explanations.push('Recursive call stack → O(n) space');
    } else if (usesAuxArray && maxDepth >= 1) {
        space = 'O(n)';
        explanations.push('Auxiliary array allocation → O(n) space');
    } else {
        space = 'O(1)';
        explanations.push('No significant extra memory allocation → O(1) space');
    }

    return { time, space, explanation: explanations, loopDepth: maxDepth, hasRecursion, hasDivideAndConquer, hasFactorial };
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function ComplexityBadge({ notation }: { notation: BigO }) {
    const entry = COMPLEXITY_TABLE.find((e) => e.notation === notation);
    const color = entry?.color ?? 'bg-gray-100 text-gray-800';
    return (
        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold font-mono', color)}>
            {notation}
        </span>
    );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

const BAR_WIDTHS: Record<BigO | 'Unknown', string> = {
    'O(1)': 'w-[4%]',
    'O(log n)': 'w-[10%]',
    'O(n)': 'w-[20%]',
    'O(n log n)': 'w-[32%]',
    'O(n²)': 'w-[50%]',
    'O(n³)': 'w-[70%]',
    'O(2ⁿ)': 'w-[88%]',
    'O(n!)': 'w-full',
    Unknown: 'w-0',
};

const BAR_COLORS: Record<BigO | 'Unknown', string> = {
    'O(1)': 'bg-green-500',
    'O(log n)': 'bg-emerald-500',
    'O(n)': 'bg-blue-500',
    'O(n log n)': 'bg-yellow-400',
    'O(n²)': 'bg-orange-500',
    'O(n³)': 'bg-red-500',
    'O(2ⁿ)': 'bg-red-700',
    'O(n!)': 'bg-red-900',
    Unknown: 'bg-gray-300',
};

function ComplexityBar({ notation, label }: { notation: BigO; label: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-16 text-gray-500 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        BAR_WIDTHS[notation] ?? 'w-0',
                        BAR_COLORS[notation] ?? 'bg-gray-300'
                    )}
                />
            </div>
            <span className="font-mono text-xs text-gray-700 w-20 shrink-0">{notation}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TimeComplexityCalculator() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<ComplexityResult | null>(null);
    const [showTable, setShowTable] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState('');

    const handleAnalyze = useCallback(() => {
        if (!code.trim()) return;
        setResult(analyzeCode(code));
    }, [code]);

    const handlePatternSelect = useCallback((patternCode: string) => {
        setCode(patternCode);
        setResult(analyzeCode(patternCode));
        setSelectedPattern(patternCode);
    }, []);

    const timeEntry = result ? COMPLEXITY_TABLE.find((e) => e.notation === result.time) : null;

    return (
        <div className="space-y-6">
            {/* Quick Patterns */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-500" />
                    Quick Patterns
                </h2>
                <div className="flex flex-wrap gap-2">
                    {COMMON_PATTERNS.map((p) => (
                        <button
                            key={p.label}
                            onClick={() => handlePatternSelect(p.code)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                selectedPattern === p.code
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Input */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                    Paste your code or pseudocode
                </label>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`// Example:\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    // O(n²)\n  }\n}`}
                    className="w-full h-48 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                    spellCheck={false}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={!code.trim()}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Analyze Complexity
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
                    <h2 className="text-sm font-semibold text-gray-700">Analysis Result</h2>

                    {/* Big O Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time Complexity</p>
                            <ComplexityBadge notation={result.time} />
                            {timeEntry && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {timeEntry.name} · <span className="font-medium">{timeEntry.rating}</span>
                                </p>
                            )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Space Complexity</p>
                            <ComplexityBadge notation={result.space} />
                        </div>
                    </div>

                    {/* Visual bar */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Growth Rate</p>
                        <ComplexityBar notation={result.time} label="Time" />
                        <ComplexityBar notation={result.space} label="Space" />
                    </div>

                    {/* Explanation */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> Explanation
                        </p>
                        <ul className="space-y-1">
                            {result.explanation.map((line, i) => (
                                <li key={i} className="text-sm text-indigo-800">
                                    • {line}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Detected features */}
                    <div className="flex flex-wrap gap-2">
                        {result.loopDepth > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {result.loopDepth} loop level{result.loopDepth > 1 ? 's' : ''}
                            </span>
                        )}
                        {result.hasRecursion && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                Recursion detected
                            </span>
                        )}
                        {result.hasDivideAndConquer && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                Divide &amp; conquer
                            </span>
                        )}
                        {result.hasFactorial && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Factorial / permutation
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Complexity Reference Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => setShowTable((v) => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <span>Big O Complexity Reference</span>
                    {showTable ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showTable && (
                    <div className="border-t border-gray-100">
                        {/* Chart */}
                        <div className="px-5 py-4 space-y-2.5 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Growth Rate Comparison</p>
                            {ORDER.map((n) => {
                                const entry = COMPLEXITY_TABLE.find((e) => e.notation === n)!;
                                return (
                                    <div key={n} className="flex items-center gap-3 text-xs">
                                        <span className="w-20 text-gray-600 font-mono shrink-0">{n}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full', BAR_WIDTHS[n], BAR_COLORS[n])}
                                            />
                                        </div>
                                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', entry.color)}>
                                            {entry.rating}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notation</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Example</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {COMPLEXITY_TABLE.map((entry) => (
                                        <tr key={entry.notation} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono', entry.color)}>
                                                    {entry.notation}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-700 font-medium">{entry.name}</td>
                                            <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{entry.example}</td>
                                            <td className="px-5 py-3 text-gray-600 text-xs">{entry.rating}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
