'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    ArrowRight,
    Download,
    CheckCircle2,
    Info,
    Settings2,
    Plus,
    Trash2,
    ArrowLeftRight,
    Key,
    Database,
    Table,
    RotateCcw,
    History,
    Search,
    Share2,
    CheckCheck,
    X,
    Clipboard,
    Undo
} from 'lucide-react';
import { VerificationRow, VerificationState, ColumnMapping, MatchType, AuditEntry, DataSource } from '../types';
import { parsePastedData, compareData } from '../lib/data-utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { saveAs } from 'file-saver';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STORAGE_KEY = 'xenkio_data_verifier_full_state';

// Filter Logic Helper
const resultsMatchFilter = (r: VerificationRow, term: string, filterType: string) => {
    if (filterType === 'issues_only' && r.status === 'identical') return false;
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    // Search in target data values
    return Object.values(r.targetData || {}).some(val => String(val).toLowerCase().includes(lowerTerm));
};

// Component for highlighting character differences
const DiffHighlight = ({ sVal, tVal }: { sVal: string, tVal: string }) => {
    if (!sVal || !tVal || sVal === tVal) return <span>{tVal}</span>;

    // Smart and simple diff using common prefix/suffix
    let start = 0;
    while (start < sVal.length && start < tVal.length && sVal[start] === tVal[start]) {
        start++;
    }

    let endS = sVal.length - 1;
    let endT = tVal.length - 1;
    while (endS >= start && endT >= start && sVal[endS] === tVal[endT]) {
        endS--;
        endT--;
    }

    const prefix = tVal.substring(0, start);
    const middle = tVal.substring(start, endT + 1);
    const suffix = tVal.substring(endT + 1);

    return (
        <span className="inline-flex flex-wrap">
            <span>{prefix}</span>
            {middle && <span className="bg-error-500/30 text-error-900 border-b-2 border-error-500 rounded-sm">{middle}</span>}
            <span>{suffix}</span>
        </span>
    );
};

export function DataVerifierContent() {
    const [targetPasted, setTargetPasted] = useState('');
    const [sourcePastedArr, setSourcePastedArr] = useState<{ id: string, name: string, content: string }[]>([
        { id: 'src-1', name: 'Master Source', content: '' }
    ]);

    const [state, setState] = useState<VerificationState>({
        targetHeaders: [],
        targetRaw: [],
        sources: [],
        columnMappings: [],
        results: [],
        auditLog: [],
        checkDuplicates: true,
        duplicateKey: ''
    });

    const [isConfiguring, setIsConfiguring] = useState(false);
    const [filter, setFilter] = useState<'all' | 'issues_only'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('verifier');
    const [page, setPage] = useState(1);
    const rowsPerPage = 50;



    // ==========================================
    // LocalStorage Hydration
    // ==========================================
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.targetHeaders) {
                    setTimeout(() => {
                        setState(parsed);
                        if (parsed.targetRaw && parsed.targetRaw.length > 0) setIsConfiguring(true);
                    }, 0);
                }
            }
        } catch (_err) {
            console.error(_err);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                const serialized = JSON.stringify(state);
                if (serialized.length < 4500000) { // ~4.5MB limit to prevent quota exceed
                    localStorage.setItem(STORAGE_KEY, serialized);
                } else {
                    console.warn('DataVerifier: State too large for localStorage, skipping save.');
                }
            } catch (err) {
                console.warn('DataVerifier: localStorage quota exceeded', err);
            }
        }, 1200);
        return () => clearTimeout(timeout);
    }, [state]);

    const addSourceInput = () => {
        setSourcePastedArr([...sourcePastedArr, { id: `src-${Date.now()}`, name: `Source ${sourcePastedArr.length + 1}`, content: '' }]);
    };

    const updateSourceInput = (id: string, content: string) => {
        setSourcePastedArr(sourcePastedArr.map(s => s.id === id ? { ...s, content } : s));
    };

    const handleInitialize = () => {
        const parsedTarget = parsePastedData(targetPasted);
        if (parsedTarget.error) return toast.error(`Target: ${parsedTarget.error}`);

        const newSources: DataSource[] = [];
        for (const s of sourcePastedArr) {
            if (!s.content.trim()) continue;
            const parsed = parsePastedData(s.content);
            if (parsed.error) return toast.error(`${s.name}: ${parsed.error}`);

            const possibleKeys = (headers: string[]) => {
                const possible = headers.map(h => h.toLowerCase());
                const idx = possible.findIndex(h => h.includes('id') || h.includes('email') || h.includes('nik') || h.includes('kode'));
                return idx !== -1 ? headers[idx] : headers[0];
            };

            newSources.push({
                id: s.id,
                name: s.name,
                headers: parsed.headers,
                rows: parsed.rows,
                sourceKey: possibleKeys(parsed.headers),
                targetKey: possibleKeys(parsedTarget.headers)
            });
        }

        if (newSources.length === 0) return toast.error("Please provide at least one source.");

        // Smart Header Auto-Detection (Improved)
        const initMappings: ColumnMapping[] = [];
        parsedTarget.headers.forEach(tCol => {
            const lowTarget = tCol.toLowerCase().replace(/[^a-z]/g, '');
            let bestMapping: ColumnMapping | null = null;
            let highestSim = 0;

            for (const src of newSources) {
                for (const sCol of src.headers) {
                    if (sCol === src.sourceKey || tCol === src.targetKey) continue;

                    const lowSource = sCol.toLowerCase().replace(/[^a-z]/g, '');
                    if (lowSource === lowTarget) {
                        bestMapping = { sourceId: src.id, sourceColumn: sCol, targetColumn: tCol, matchType: 'exact' };
                        highestSim = 1.0;
                        break;
                    }
                }
                if (highestSim === 1.0) break;
            }
            if (bestMapping) initMappings.push(bestMapping);
        });

        setState({
            targetHeaders: parsedTarget.headers,
            targetRaw: parsedTarget.rows,
            sources: newSources,
            columnMappings: initMappings,
            results: [],
            auditLog: [],
            checkDuplicates: true,
            duplicateKey: state.duplicateKey || parsedTarget.headers[0]
        });

        setIsConfiguring(true);
    };

    const runCompare = useCallback(() => {
        if (state.columnMappings.length === 0) return toast.error("Please add at least one column to verify.");
        const results = compareData(state);
        // Preserve previous audit logs on re-run
        setState(prev => ({ ...prev, results, auditLog: prev.auditLog }));
        toast.success(`Verification complete! Found ${results.length} rows.`);
    }, [state]);

    const addMapping = () => {
        if (state.sources.length === 0) return;
        setState(prev => ({
            ...prev,
            columnMappings: [...prev.columnMappings, { sourceId: prev.sources[0].id, sourceColumn: prev.sources[0].headers[0], targetColumn: prev.targetHeaders[0], matchType: 'exact' }]
        }));
    };

    const updateMapping = (index: number, changes: Partial<ColumnMapping>) => {
        setState(prev => {
            const nextMap = [...prev.columnMappings];
            nextMap[index] = { ...nextMap[index], ...changes };
            return { ...prev, columnMappings: nextMap };
        });
    };

    const removeMapping = (index: number) => {
        setState(prev => ({ ...prev, columnMappings: prev.columnMappings.filter((_, i) => i !== index) }));
    };

    const handleFixRow = (rowId: string) => {
        setState(prev => {
            const nextAudit = [...prev.auditLog];
            const nextTargetRaw = [...prev.targetRaw];

            const nextResults = prev.results.map(r => {
                if (r._id === rowId && (r.status === 'mismatch' || r.status === 'partial')) {
                    const fixed = { ...r.targetData };
                    let changed = false;
                    [...r.mismatchedColumns, ...r.partialColumns].forEach(tCol => {
                        const m = prev.columnMappings.find(map => map.targetColumn === tCol);
                        if (m && r.sourceData?.[m.sourceId]) {
                            const newValue = String(r.sourceData[m.sourceId][m.sourceColumn]);
                            const oldValue = String(fixed[tCol] || '');
                            if (newValue !== oldValue) {
                                fixed[tCol] = newValue;
                                changed = true;
                                nextAudit.push({ rowId, timestamp: Date.now(), column: tCol, oldValue, newValue });
                            }
                        }
                    });

                    if (changed) {
                        const rowIdx = parseInt(rowId.replace('v-row-', '')) - 1;
                        if (rowIdx >= 0 && rowIdx < nextTargetRaw.length) {
                            nextTargetRaw[rowIdx] = { ...fixed };
                        }
                    }
                    return { ...r, targetData: fixed, status: 'identical', mismatchedColumns: [], partialColumns: [] };
                }
                return r;
            });

            return { ...prev, results: nextResults as VerificationRow[], auditLog: nextAudit, targetRaw: nextTargetRaw };
        });
    };

    const handleSyncAll = useCallback(() => {
        setState(prev => {
            const nextAudit = [...prev.auditLog];
            const nextTargetRaw = [...prev.targetRaw];

            const nextResults = prev.results.map(r => {
                if ((r.status === 'mismatch' || r.status === 'partial') && resultsMatchFilter(r, searchTerm, filter)) {
                    const fixed = { ...r.targetData };
                    let changed = false;
                    [...r.mismatchedColumns, ...r.partialColumns].forEach(tCol => {
                        const m = prev.columnMappings.find(map => map.targetColumn === tCol);
                        if (m && r.sourceData?.[m.sourceId]) {
                            const newValue = String(r.sourceData[m.sourceId][m.sourceColumn]);
                            const oldValue = String(fixed[tCol] || '');
                            if (newValue !== oldValue) {
                                fixed[tCol] = newValue;
                                changed = true;
                                nextAudit.push({ rowId: r._id, timestamp: Date.now(), column: tCol, oldValue, newValue });
                            }
                        }
                    });

                    if (changed) {
                        const rowIdx = parseInt(r._id.replace('v-row-', '')) - 1;
                        if (rowIdx >= 0 && rowIdx < nextTargetRaw.length) {
                            nextTargetRaw[rowIdx] = { ...fixed };
                        }
                    }
                    return { ...r, targetData: fixed, status: 'identical', mismatchedColumns: [], partialColumns: [] };
                }
                return r;
            });
            return { ...prev, results: nextResults as VerificationRow[], auditLog: nextAudit, targetRaw: nextTargetRaw };
        });
        toast.success("Synchronized all filtered issues!");
    }, [searchTerm, filter]);

    const handleUndo = (logIndex: number, log: AuditEntry) => {
        setState(prev => {
            const nextAudit = [...prev.auditLog];
            nextAudit.splice(logIndex, 1);

            const nextTargetRaw = [...prev.targetRaw];
            const rowIdx = parseInt(log.rowId.replace('v-row-', '')) - 1;
            if (rowIdx >= 0 && rowIdx < nextTargetRaw.length) {
                nextTargetRaw[rowIdx] = { ...nextTargetRaw[rowIdx], [log.column]: log.oldValue };
            }

            const nextResults = prev.results.map(r => {
                if (r._id === log.rowId) {
                    const revertedData = { ...r.targetData, [log.column]: log.oldValue };
                    // Set status back to mismatch so it can be re-evaluated
                    return { ...r, targetData: revertedData, status: 'mismatch' };
                }
                return r;
            });

            return { ...prev, results: nextResults as VerificationRow[], auditLog: nextAudit, targetRaw: nextTargetRaw };
        });
        toast.success("Action undone successfully!");
    };

    const handleExportCSV = () => {
        const rows = state.results.map(r => r.targetData).filter(Boolean);
        if (rows.length === 0) return;
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r || {}))));
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r?.[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'verified_data.csv');
    };

    const handleCopyTSV = async () => {
        const rows = state.results.map(r => r.targetData).filter(Boolean);
        if (rows.length === 0) return;
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r || {}))));
        const tsv = [headers.join('\t'), ...rows.map(r => headers.map(h => r?.[h] || '').join('\t'))].join('\n');
        try {
            await navigator.clipboard.writeText(tsv);
            toast.success("Copied to clipboard! Ready to paste into Excel.");
        } catch {
            toast.error("Failed to copy data.");
        }
    };




    const stats = useMemo(() => {
        return {
            total: state.results.length,
            mismatch: state.results.filter(r => r.status === 'mismatch' || r.status === 'partial').length,
            missing: state.results.filter(r => r.status === 'missing_in_source').length,
            dupes: state.results.filter(r => r.status === 'duplicate').length,
            ident: state.results.filter(r => r.status === 'identical').length,
            fixes: state.auditLog.length
        };
    }, [state.results, state.auditLog]);

    const displayedResults = useMemo(() => {
        return state.results.filter(r => resultsMatchFilter(r, searchTerm, filter));
    }, [state.results, filter, searchTerm]);

    const paginatedResults = useMemo(() => {
        return displayedResults.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    }, [displayedResults, page]);

    const totalPages = Math.ceil(displayedResults.length / rowsPerPage);

    // Reset page logic moved to change handlers to avoid setState in effect


    // Keyboard Shortcuts
    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => { if (e.ctrlKey && e.shiftKey && e.key === 'Enter') handleSyncAll(); };
        window.addEventListener('keydown', handleDown);
        return () => window.removeEventListener('keydown', handleDown);
    }, [handleSyncAll]);

    // ==========================================
    // RENDER: STEP 1 (Input)
    // ==========================================
    if (!isConfiguring) {
        return (
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-black text-gray-900 font-serif">Data Verifier Pro</h1>
                    <div className="flex gap-2 text-xs font-bold text-gray-400"><Database className="w-3 h-3" /> V2.5 Multi-Source</div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Database, color: 'text-success-600', bg: 'bg-success-50', title: 'Power VLOOKUP', desc: 'Sync data across multiple sources instantly.' },
                        { icon: Share2, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Copy-Paste Export', desc: 'Copy results directly back to Excel.' },
                        { icon: History, color: 'text-primary-600', bg: 'bg-primary-50', title: 'Audit Trail', desc: 'Keep track of every change made.' }
                    ].map((item, i) => (
                        <Card key={i} className="p-5 border-none shadow-soft-xl bg-white/60 backdrop-blur-md">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-lg font-bold text-indigo-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">1</div>
                            Target Data to Verify (e.g. Sales, Transactions)
                        </Label>
                        <textarea
                            className="w-full h-64 p-5 font-mono text-sm bg-white rounded-3xl border-2 border-indigo-100 outline-none focus:border-indigo-400 focus:ring-4 ring-indigo-50 shadow-soft transition-all"
                            placeholder="Copy-paste your Excel data here..."
                            value={targetPasted}
                            onChange={e => setTargetPasted(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-lg font-bold text-success-700 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center text-success-600 text-sm">2</div>
                                Reference Sources (Master Data)
                            </Label>
                            <Button variant="outline" size="sm" onClick={addSourceInput} className="rounded-2xl border-success-200 text-success-700 hover:bg-success-50 h-10 px-6 font-bold">
                                <Plus className="w-4 h-4 mr-2" /> Add Reference
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-1 gap-6">
                            {sourcePastedArr.map((s) => (
                                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="flex gap-3 mb-2 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                        <Database className="w-4 h-4 text-success-400 ml-2" />
                                        <Input
                                            value={s.name}
                                            onChange={e => setSourcePastedArr(sourcePastedArr.map(item => item.id === s.id ? { ...item, name: e.target.value } : item))}
                                            className="w-48 h-8 font-black text-[10px] uppercase bg-white border-success-100 rounded-lg"
                                        />
                                        <div className="flex-1" />
                                        {sourcePastedArr.length > 1 && (
                                            <Button variant="ghost" size="sm" onClick={() => setSourcePastedArr(sourcePastedArr.filter(item => item.id !== s.id))} className="h-8 w-8 p-0 text-gray-300 hover:text-error-600">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <textarea
                                        className="w-full h-48 p-5 font-mono text-sm bg-white rounded-3xl border-2 border-success-100 outline-none focus:border-success-400 focus:ring-4 ring-success-50 shadow-soft transition-all"
                                        placeholder={`Paste master data for ${s.name}...`}
                                        value={s.content}
                                        onChange={e => updateSourceInput(s.id, e.target.value)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pb-20">
                    <Button onClick={handleInitialize} size="lg" className="px-16 h-16 rounded-full text-lg font-black shadow-xl hover:scale-105 active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700" disabled={!targetPasted}>
                        Next: Map & Match <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: STEP 2 (Configuration)
    // ==========================================
    if (state.results.length === 0) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4 font-serif">
                        <Settings2 className="w-8 h-8 text-indigo-600" /> Verifier Configuration
                    </h2>
                    <Button variant="ghost" onClick={() => setIsConfiguring(false)} className="text-gray-400 hover:text-gray-900 rounded-2xl h-12 px-6"><RotateCcw className="w-4 h-4 mr-2" /> Start Over</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="p-8 border-none shadow-soft-xl bg-white/70 backdrop-blur-md space-y-6 rounded-3xl">
                        <h3 className="font-black text-gray-900 text-xl flex items-center gap-3"><Key className="w-5 h-5 text-indigo-600" /> Identity Logic</h3>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <Checkbox id="dupe-check" checked={state.checkDuplicates} onCheckedChange={val => setState({ ...state, checkDuplicates: !!val })} />
                                <Label htmlFor="dupe-check" className="text-sm font-bold cursor-pointer text-indigo-900">Check duplicate rows in Target</Label>
                            </div>
                            {state.checkDuplicates && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Unique Identifier in Target</Label>
                                    <Select value={state.duplicateKey} onValueChange={val => setState({ ...state, duplicateKey: val })}>
                                        <SelectTrigger className="bg-white border-gray-200 h-12 rounded-xl shadow-sm"><SelectValue placeholder="Select ID Column" /></SelectTrigger>
                                        <SelectContent>{state.targetHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 border-none shadow-soft-xl bg-white/70 backdrop-blur-md space-y-6 rounded-3xl">
                        <h3 className="font-black text-gray-900 text-xl flex items-center gap-3"><Database className="w-5 h-5 text-success-600" /> Source Linkage</h3>
                        <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                            {state.sources.map(src => (
                                <div key={src.id} className="p-4 bg-success-50/50 rounded-2xl border border-success-100 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase text-success-700 flex items-center gap-2"><Table className="w-3.5 h-3.5" /> {src.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr_20px_1fr] gap-3 items-center">
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-success-600 font-black uppercase ml-1">Source Key</span>
                                            <Select value={src.sourceKey} onValueChange={v => setState({ ...state, sources: state.sources.map(s => s.id === src.id ? { ...s, sourceKey: v } : s) })}>
                                                <SelectTrigger className="h-10 bg-white text-xs rounded-xl"><SelectValue /></SelectTrigger>
                                                <SelectContent>{src.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="pt-4 text-success-300"><ArrowLeftRight className="w-3 h-3" /></div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-success-600 font-black uppercase ml-1">Target Key</span>
                                            <Select value={src.targetKey} onValueChange={v => setState({ ...state, sources: state.sources.map(s => s.id === src.id ? { ...s, targetKey: v } : s) })}>
                                                <SelectTrigger className="h-10 bg-white text-xs rounded-xl"><SelectValue /></SelectTrigger>
                                                <SelectContent>{state.targetHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="p-8 border-none shadow-soft-xl bg-white/70 backdrop-blur-md space-y-8 rounded-3xl mb-20">
                    <div className="flex justify-between items-center bg-gray-50/50 -mx-8 -mt-8 p-8 border-b border-gray-100 rounded-t-3xl">
                        <h3 className="font-black text-gray-900 text-xl flex items-center gap-3"><CheckCheck className="w-6 h-6 text-primary-600" /> Comparison Attributes</h3>
                        <Button onClick={addMapping} variant="outline" size="sm" className="rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-10 px-6 font-bold shadow-sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Column Pair
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {state.columnMappings.map((m, i) => (
                            <motion.div key={i} layout className="group grid grid-cols-1 lg:grid-cols-[1.5fr_max-content_1fr_1fr_1fr_max-content] gap-4 items-end bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-soft transition-all">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Compare Target Column</Label>
                                    <Select value={m.targetColumn} onValueChange={v => updateMapping(i, { targetColumn: v })}>
                                        <SelectTrigger className="h-11 bg-white font-bold rounded-xl"><SelectValue placeholder="Target" /></SelectTrigger>
                                        <SelectContent>{state.targetHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-center pb-3.5 text-gray-200"><ArrowRight className="w-5 h-5" /></div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-success-600 uppercase tracking-widest ml-1">With Source</Label>
                                    <Select value={m.sourceId} onValueChange={v => {
                                        const newSrc = state.sources.find(s => s.id === v);
                                        updateMapping(i, { sourceId: v, sourceColumn: newSrc?.headers[0] || '' });
                                    }}>
                                        <SelectTrigger className="h-11 bg-white font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>{state.sources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-success-600 uppercase tracking-widest ml-1">Source Column</Label>
                                    <Select value={m.sourceColumn} onValueChange={v => updateMapping(i, { sourceColumn: v })}>
                                        <SelectTrigger className="h-11 bg-white font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>{state.sources.find(s => s.id === m.sourceId)?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Match Methodology</Label>
                                    <Select value={m.matchType} onValueChange={v => updateMapping(i, { matchType: v as MatchType })}>
                                        <SelectTrigger className="h-11 bg-white rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="exact">Exact Match</SelectItem>
                                            <SelectItem value="contains">Contains (Partial)</SelectItem>
                                            <SelectItem value="fuzzy">Fuzzy (Typo Detection)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeMapping(i)} className="h-11 w-11 rounded-xl text-gray-300 hover:text-error-600 hover:bg-error-50">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-10 flex justify-center">
                        <Button onClick={runCompare} size="lg" className="px-24 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl text-xl font-black w-full max-w-md transition-all hover:scale-[1.03]">
                            Initialize Verifier
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ==========================================
    // RENDER: STEP 3 (RESULTS)
    // ==========================================
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                <Card className="flex-1 p-6 border-none shadow-soft-xl flex flex-wrap gap-x-12 gap-y-6 items-center bg-white/ backdrop-blur-md rounded-3xl">
                    <div className="flex-shrink-0">
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-indigo-600 leading-none">{Math.round((stats.ident / stats.total) * 100) || 0}%</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-900 leading-none">CLEANSE</span>
                                <span className="text-[11px] font-bold text-gray-400">SCORE %</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 justify-around gap-4 min-w-[300px]">
                        <div className="text-center">
                            <span className="block text-3xl font-black text-error-600">{stats.mismatch}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mismatches</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-3xl font-black text-orange-500">{stats.dupes}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duplicates</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-3xl font-black text-warning-600">{stats.missing}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Missing Ref</span>
                        </div>
                        <div className="text-center border-l border-gray-100 pl-8">
                            <span className="block text-3xl font-black text-success-600">{stats.fixes}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fixed Logs</span>
                        </div>
                    </div>
                </Card>

                <div className="flex lg:flex-col gap-3 justify-center">
                    <Button variant="outline" onClick={handleCopyTSV} className="h-full min-h-[50px] px-8 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 shadow-sm font-black text-indigo-600 group">
                        <Clipboard className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> COPY TO CLIPBOARD
                    </Button>
                    <Button onClick={handleExportCSV} className="h-full min-h-[50px] px-8 rounded-2xl bg-gray-900 border-gray-900 shadow-soft-xl hover:bg-black font-black text-white group">
                        <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> DOWNLOAD CSV
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <TabsList className="bg-white/50 border border-white backdrop-blur-sm p-1.5 rounded-2xl gap-2 shadow-sm h-14">
                        <TabsTrigger value="verifier" className="rounded-xl px-10 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-full transition-all">
                            <CheckCheck className="w-4 h-4 mr-2" /> Comparison View
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="rounded-xl px-10 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-full transition-all">
                            <History className="w-4 h-4 mr-2" /> Audit Trail ({stats.fixes})
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-4 self-end sm:self-auto">
                        <Button variant="ghost" onClick={() => setState(prev => ({ ...prev, results: [] }))} className="rounded-2xl h-11 px-6 font-bold text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><RotateCcw className="w-4 h-4 mr-2" /> Adjust Mapping</Button>
                    </div>
                </div>

                <TabsContent value="verifier" className="space-y-4 outline-none">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white/50 p-3 rounded-2xl backdrop-blur-md border border-white/50 shadow-sm gap-4">
                        <div className="flex items-center gap-3 flex-1 w-full max-w-xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    className="pl-10 h-11 bg-white/80 border-gray-100 rounded-xl focus:ring-4 ring-indigo-50 font-medium"
                                    placeholder="Search specific records to verify..."
                                    value={searchTerm}
                                    onChange={e => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                                {searchTerm && <button onClick={() => {
                                    setSearchTerm('');
                                    setPage(1);
                                }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>}
                            </div>

                            <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-xl">
                                <button onClick={() => { setFilter('all'); setPage(1); }} className={cn("px-5 py-1.5 rounded-lg text-xs font-black transition-all", filter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600 uppercase tracking-widest")}>All</button>
                                <button onClick={() => { setFilter('issues_only'); setPage(1); }} className={cn("px-5 py-1.5 rounded-lg text-xs font-black transition-all", filter === 'issues_only' ? "bg-white text-error-600 shadow-sm" : "text-gray-400 hover:text-gray-600 uppercase tracking-widest")}>Issues</button>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="hidden xl:flex gap-6 text-[10px] font-black uppercase text-gray-300 tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-error-400" /> Mismatch</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning-400" /> Partial</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> Dupe</div>
                            </div>

                            {(stats.mismatch > 0 || stats.missing > 0) && (
                                <Button onClick={handleSyncAll} className="bg-indigo-600 text-white hover:bg-indigo-700 h-11 font-black px-8 rounded-xl shadow-indigo-200 shadow-md scale-100 hover:scale-105 active:scale-95 transition-all">
                                    <CheckCheck className="w-4 h-4 mr-2" /> QUICK FIX FILTERED
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="border-none shadow-soft-xl overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-white">
                        <div className="overflow-auto max-h-[650px] custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 w-12 text-center text-[10px] font-black text-gray-300 uppercase">#</th>
                                        <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Ref Point ({state.duplicateKey || state.targetHeaders[0]})</th>
                                        {state.columnMappings.map(m => (
                                            <th key={m.targetColumn} className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">{m.targetColumn}</th>
                                        ))}
                                        <th className="p-4 w-40 text-center text-[11px] font-black text-gray-500 uppercase sticky right-0 bg-gray-50/95 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.05)] border-l border-gray-100">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[13px] font-medium">
                                    <AnimatePresence initial={false}>
                                        {paginatedResults.map((r, i) => (
                                            <motion.tr
                                                key={r._id}
                                                layout="position"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className={cn(
                                                    "group border-b border-gray-50/50 transition-all h-24",
                                                    r.status === 'mismatch' ? 'bg-error-50/10 hover:bg-error-50/30' :
                                                        r.status === 'partial' ? 'bg-warning-50/10 hover:bg-warning-50/30' :
                                                            r.status === 'duplicate' ? 'bg-orange-50/10 hover:bg-orange-50/30' :
                                                                r.status === 'missing_in_source' ? 'bg-gray-50/30 hover:bg-gray-100' : 'hover:bg-gray-50/80'
                                                )}
                                            >
                                                <td className="p-4 text-center font-mono text-[10px] text-gray-300">{((page - 1) * rowsPerPage) + i + 1}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono font-black text-gray-900 leading-none antialiased">{r.targetData?.[state.duplicateKey || state.targetHeaders[0]]}</span>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {r.isDuplicate && <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[9px] uppercase font-black tracking-tighter border border-orange-200 shadow-sm">Duplicate Detected</span>}
                                                            {r.status === 'missing_in_source' && <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 text-[9px] uppercase font-black tracking-tighter shadow-sm">Unknown Reference</span>}
                                                            {r.status === 'partial' && <span className="px-1.5 py-0.5 rounded bg-warning-100 text-warning-700 text-[9px] uppercase font-black tracking-tighter border border-warning-200 shadow-sm">Partial Match</span>}
                                                            {r.status === 'mismatch' && <span className="px-1.5 py-0.5 rounded bg-error-100 text-error-700 text-[9px] uppercase font-black tracking-tighter border border-error-200 shadow-sm">Data Mismatch</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                {state.columnMappings.map(m => {
                                                    const isMismatch = r.mismatchedColumns.includes(m.targetColumn);
                                                    const isPartial = r.partialColumns.includes(m.targetColumn);
                                                    const sVal = r.sourceData?.[m.sourceId]?.[m.sourceColumn] || '';
                                                    const tVal = r.targetData?.[m.targetColumn] || '';

                                                    return (
                                                        <td key={m.targetColumn} className="p-4 relative">
                                                            <div className={cn(
                                                                "px-4 py-3 rounded-2xl transition-all group-hover:scale-[1.01] antialiased",
                                                                isMismatch ? "bg-error-50 text-error-700 border border-error-100" :
                                                                    isPartial ? "bg-warning-50 text-warning-700 border border-warning-200" : "text-gray-600 bg-gray-50/50 border border-gray-100/50"
                                                            )}>
                                                                <DiffHighlight sVal={sVal} tVal={tVal} />
                                                                {!tVal && <span className="opacity-20 italic">Empty_Cell</span>}
                                                            </div>
                                                            {(isMismatch || isPartial) && (
                                                                <div className="absolute top-1 right-6 z-10 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none">
                                                                    <div className="bg-success-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                                                                        <ArrowRight className="w-3 h-3" /> Correct: {sVal}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="p-4 text-center sticky right-0 group-hover:bg-indigo-50/50 backdrop-blur-sm transition-all shadow-[-20px_0_30px_-5px_rgba(0,0,0,0.03)] border-l border-gray-100 bg-white">
                                                    {(r.status === 'mismatch' || r.status === 'partial') ? (
                                                        <Button size="sm" onClick={() => handleFixRow(r._id)} className="h-11 px-5 rounded-2xl bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm font-black text-xs transition-all ring-0 focus:ring-4 ring-indigo-100">
                                                            <RotateCcw className="w-4 h-4 mr-2" /> REPAIR
                                                        </Button>
                                                    ) : r.status === 'identical' ? (
                                                        <div className="flex items-center justify-center gap-2.5 text-success-500 bg-success-50/80 py-2 rounded-2xl border border-success-100">
                                                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-1 opacity-20">
                                                            <Info className="w-5 h-5" />
                                                            <span className="text-[9px] font-black uppercase tracking-tighter">Skip</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between text-sm px-4 pt-4">
                            <span className="text-gray-500 font-bold bg-white/50 px-4 py-2 rounded-xl border border-white/50">Page {page} of {totalPages} <span className="text-gray-300 mx-2">|</span> {displayedResults.length} records</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-xl border-white/50 bg-white/50 h-10 px-6 font-bold text-gray-700"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-xl border-white/50 bg-white/50 h-10 px-6 font-bold text-gray-700"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="audit" className="outline-none">
                    <Card className="border-none shadow-soft-xl overflow-hidden rounded-3xl bg-white border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">Audit Trail Logging</h3>
                                <p className="text-sm text-gray-500">Every manual and automatic synchronization is recorded here.</p>
                            </div>
                            <Button variant="outline" onClick={() => setState({ ...state, auditLog: [] })} className="rounded-xl h-10 border-gray-200">Clear Logs</Button>
                        </div>
                        <div className="overflow-auto max-h-[500px] p-2 custom-scrollbar">
                            {state.auditLog.length === 0 ? (
                                <div className="p-20 text-center space-y-4 opacity-30">
                                    <History className="w-16 h-16 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-[0.2em]">No changes recorded yet</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <tr>
                                            <th className="p-4">Time</th>
                                            <th className="p-4">Record ID</th>
                                            <th className="p-4">Field</th>
                                            <th className="p-4">Change Log</th>
                                            <th className="p-4 w-28 text-center" />
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {state.auditLog.map((log, i) => (
                                            <tr key={i} className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 text-xs text-gray-400 font-mono italic">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                <td className="p-4 font-black text-gray-900">{log.rowId}</td>
                                                <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">{log.column}</span></td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-error-400 line-through bg-error-50 px-2 py-0.5 rounded text-xs">{log.oldValue || 'null'}</span>
                                                        <ArrowRight className="w-3 h-3 text-gray-300" />
                                                        <span className="text-success-700 font-bold bg-success-50 px-2 py-0.5 rounded text-xs">{log.newValue}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUndo(i, log)}
                                                        className="h-8 px-3 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 font-bold text-[11px]"
                                                    >
                                                        <Undo className="w-3.5 h-3.5 mr-1.5" /> UNDO
                                                    </Button>
                                                </td>
                                            </tr>
                                        )).reverse()}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="text-center p-8 bg-gray-50/50 rounded-b-3xl border-t border-gray-100 -mx-4">
                <p className="text-[11px] font-black text-gray-300 uppercase flex items-center justify-center gap-4">
                    <span className="flex items-center gap-2 saturate-0 opacity-50"><Database className="w-3.5 h-3.5" /> LOCAL_ENCRYPTION_SAFE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> DIRECT CLIPBOARD OUTPUT ACTIVE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-2"><History className="w-3.5 h-3.5" /> REAL-TIME DIFF_ENGINE_V2</span>
                </p>
            </div>
        </div>
    );
}
