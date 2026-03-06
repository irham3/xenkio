'use client';
// Trigger rebuild for route recognition
import { useState, useRef } from 'react';
import { useDataChecker } from '@/features/data-checker/hooks/use-data-checker';
import { ReviewCard } from '@/features/data-checker/components/review-card';
import { ItemList } from '@/features/data-checker/components/item-list';
import { ProgressOverview } from '@/features/data-checker/components/progress-overview';
import { SAMPLE_DATA } from '@/features/data-checker/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    Upload,
    Trash2,
    Download,
    FileSpreadsheet,
    RotateCcw,
    ClipboardPaste,
    FileText,
    Zap,
    List,
    ChevronRight,
    CheckCircle2,
    XCircle,
    PartyPopper,
    Pencil,
    Undo2,
} from 'lucide-react';

export default function DataCheckerClient() {
    const {
        state,
        stats,
        currentRow,
        nextRow,
        loadData,
        markCurrentValid,
        markCurrentInvalid,
        setRowStatus,
        goToIndex,
        goToNext,
        goToPrev,
        goToNextUnchecked,
        resetAll,
        clearAll,
        updateRowValue,
        undo,
        exportAsCSV,
    } = useDataChecker();

    const [textInput, setTextInput] = useState('');
    const [showList, setShowList] = useState(false);
    const [forceReview, setForceReview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasData = state.rows.length > 0;
    const isAllChecked = hasData && stats.progress === 100;
    const showSummary = isAllChecked && !forceReview;

    const handleLoadData = () => {
        if (textInput.trim()) {
            loadData(textInput);
            setForceReview(false);
        }
    };

    const handleLoadSample = () => {
        setTextInput(SAMPLE_DATA);
        loadData(SAMPLE_DATA);
        setForceReview(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setTextInput(content);
            loadData(content);
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTextInput(text);
        } catch {
            // Clipboard API not available
        }
    };

    const handleExportCSV = () => {
        const csv = exportAsCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `data-check-results-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        clearAll();
        setTextInput('');
    };

    return (
        <div className="w-full space-y-0">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <>
                    {/* Toolbar (only when data is loaded) */}
                    {hasData && (
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setShowList(!showList)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
                                        showList
                                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    )}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    All Items
                                    <ChevronRight className={cn("w-3 h-3 transition-transform", showList && "rotate-90")} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                                <button
                                    onClick={undo}
                                    disabled={state.history.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Undo2 className="w-3.5 h-3.5" />
                                    Undo
                                </button>
                                {isAllChecked && !showSummary && (
                                    <button
                                        onClick={() => setForceReview(false)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Summary
                                    </button>
                                )}
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-all"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                    title="Clear all data"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input Area (when no data loaded) */}
                    {!hasData && (
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <Label htmlFor="data-input" className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-primary-500" />
                                        Enter Your Data
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePaste}
                                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-all"
                                        >
                                            <ClipboardPaste className="w-3 h-3" />
                                            Paste
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-all"
                                        >
                                            <Upload className="w-3 h-3" />
                                            Upload
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.tsv,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400">
                                    Enter one item per line. Each line becomes one item to check.
                                </p>

                                <textarea
                                    id="data-input"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder={`Enter data to validate, one per line:\n\nJohn Doe - john@example.com\nJane Smith - jane@mail.com\nBob Wilson - +62812345678\n...`}
                                    className="w-full min-h-[220px] p-4 text-[14px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-y placeholder:text-gray-400"
                                />

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleLoadData}
                                        disabled={!textInput.trim()}
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all h-12 text-base"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Start Checking
                                    </Button>
                                    <button
                                        onClick={handleLoadSample}
                                        className="px-5 h-12 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
                                    >
                                        Load Sample
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Loaded: Review Flow */}
                    {hasData && (
                        <div className="flex flex-col lg:flex-row">
                            {/* Item List Sidebar (toggleable) */}
                            {showList && (
                                <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 bg-gray-50/30 animate-in slide-in-from-left-2 duration-200">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        All Items ({stats.total})
                                    </h3>
                                    <ItemList
                                        rows={state.rows}
                                        currentIndex={state.currentIndex}
                                        onGoToIndex={(idx) => {
                                            goToIndex(idx);
                                            if (isAllChecked) setForceReview(true);
                                        }}
                                        onSetRowStatus={setRowStatus}
                                    />
                                </div>
                            )}

                            {/* Main Review Area */}
                            <div className="flex-1 p-6">
                                {/* Progress */}
                                <div className="mb-6">
                                    <ProgressOverview stats={stats} />
                                </div>

                                {/* Completion Screen */}
                                {showSummary ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-500">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                            <PartyPopper className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h3>
                                        <p className="text-sm text-gray-500 mb-8 max-w-[300px]">
                                            You&apos;ve reviewed all {stats.total} items. Here&apos;s the summary:
                                        </p>

                                        {/* Summary Cards */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex flex-col items-center gap-1 px-6 py-4 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                                                <span className="text-3xl font-bold text-emerald-700 tabular-nums">{stats.valid}</span>
                                                <span className="text-xs font-medium text-emerald-600/70">Valid</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 px-6 py-4 bg-red-50 border border-red-200/60 rounded-xl">
                                                <XCircle className="w-6 h-6 text-red-500 mb-1" />
                                                <span className="text-3xl font-bold text-red-700 tabular-nums">{stats.invalid}</span>
                                                <span className="text-xs font-medium text-red-600/70">Invalid</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 w-full max-w-xs">
                                            <button
                                                onClick={handleExportCSV}
                                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                                            >
                                                <Download className="w-5 h-5" />
                                                Export Results as CSV
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setForceReview(true)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Edit Items
                                                </button>
                                                <button
                                                    onClick={resetAll}
                                                    className="flex-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Review Again
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Review Card */
                                    <ReviewCard
                                        currentRow={currentRow}
                                        nextRow={nextRow}
                                        currentIndex={state.currentIndex}
                                        stats={stats}
                                        onMarkValid={markCurrentValid}
                                        onMarkInvalid={markCurrentInvalid}
                                        onGoToNext={goToNext}
                                        onGoToPrev={goToPrev}
                                        onGoToNextUnchecked={goToNextUnchecked}
                                        onUpdateValue={(val) => updateRowValue(state.currentIndex, val)}
                                        onUndo={undo}
                                        canUndo={state.history.length > 0}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!hasData && !textInput && (
                        <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready to Check</h3>
                                <p className="text-xs text-gray-500 max-w-[300px]">
                                    Enter your data above — one item per line. Then review each item one by one,
                                    marking it as valid or invalid.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            </div>
        </div>
    );
}
