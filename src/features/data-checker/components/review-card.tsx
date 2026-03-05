'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DataRow, DataCheckerStats } from '../types';
import {
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    SkipForward,
    Pencil,
    Save,
    Undo2,
    AlertTriangle,
} from 'lucide-react';

interface ReviewCardProps {
    currentRow: DataRow | null;
    currentIndex: number;
    stats: DataCheckerStats;
    onMarkValid: () => void;
    onMarkInvalid: (comment: string) => void;
    onGoToNext: () => void;
    onGoToPrev: () => void;
    onGoToNextUnchecked: () => void;
    onUpdateValue: (newValue: string) => void;
    onUndo: () => void;
    canUndo: boolean;
}

const QUICK_TAGS = [
    "Typo",
    "Invalid Format",
    "Empty Field",
    "Wrong Category",
    "Duplicate",
    "Incomplete",
];

const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+?\d{1,4}[-.\s]?)?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

export function ReviewCard({
    currentRow,
    currentIndex,
    stats,
    onMarkValid,
    onMarkInvalid,
    onGoToNext,
    onGoToPrev,
    onGoToNextUnchecked,
    onUpdateValue,
    onUndo,
    canUndo,
}: ReviewCardProps) {
    const [commentText, setCommentText] = useState('');
    const [isCommentMode, setIsCommentMode] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);
    const prevRowIdRef = useRef<string | undefined>(undefined);

    const [isEditingValue, setIsEditingValue] = useState(false);
    const [editValueText, setEditValueText] = useState('');

    // Reset comment mode when row changes (using ref comparison during render)
    const currentRowId = currentRow?.id;
    if (currentRowId !== prevRowIdRef.current) {
        prevRowIdRef.current = currentRowId;
        if (isCommentMode) setIsCommentMode(false);
        if (isEditingValue) setIsEditingValue(false);
        if (commentText) setCommentText('');
        setEditValueText(currentRow?.value || '');
    }

    // Focus card or comment input based on mode
    useEffect(() => {
        if (isCommentMode && commentInputRef.current) {
            commentInputRef.current.focus();
        } else if (isEditingValue && editInputRef.current) {
            editInputRef.current.focus();
        } else if (!isCommentMode && !isEditingValue && cardRef.current) {
            cardRef.current.focus();
        }
    }, [currentRowId, isCommentMode, isEditingValue]);

    const handleStartEditing = useCallback(() => {
        setEditValueText(currentRow?.value || '');
        setIsEditingValue(true);
    }, [currentRow?.value]);

    const playSuccessSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);       // A4 — warm, neutral
            osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.05); // slight rise
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);  // longer fade = premium feel
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } catch {
            // Silently ignore if Web Audio API is not available
        }
    }, []);

    const playErrorSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch {
            // Silently ignore if Web Audio API is not available
        }
    }, []);

    const handleMarkValid = useCallback(() => {
        playSuccessSound();
        onMarkValid();
    }, [playSuccessSound, onMarkValid]);

    const handleSaveEdit = useCallback(() => {
        if (editValueText.trim() && editValueText !== currentRow?.value) {
            onUpdateValue(editValueText.trim());
        }
        setIsEditingValue(false);
    }, [editValueText, currentRow?.value, onUpdateValue]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (isCommentMode || isEditingValue) return; // Let inputs handle their own keys

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMarkValid();
        }
        if (e.key === 'ArrowRight' || e.key === 'j') {
            e.preventDefault();
            onGoToNext();
        }
        if (e.key === 'ArrowLeft' || e.key === 'k') {
            e.preventDefault();
            onGoToPrev();
        }
        if (e.key === 'n' || e.key === 'N') {
            e.preventDefault();
            onGoToNextUnchecked();
        }
        if (e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            handleStartEditing();
        }
        if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (canUndo) onUndo();
        }
    }, [isCommentMode, isEditingValue, handleMarkValid, onGoToNext, onGoToPrev, onGoToNextUnchecked, handleStartEditing, onUndo, canUndo]);

    const handleInvalidSubmit = useCallback(() => {
        playErrorSound();
        onMarkInvalid(commentText);
        setCommentText('');
        setIsCommentMode(false);
    }, [commentText, onMarkInvalid, playErrorSound]);

    const handleCommentKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInvalidSubmit();
        }
        if (e.key === 'Escape') {
            setIsCommentMode(false);
            setCommentText('');
            cardRef.current?.focus();
        }
    }, [handleInvalidSubmit]);

    const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
        }
        if (e.key === 'Escape') {
            setIsEditingValue(false);
            setEditValueText(currentRow?.value || '');
            cardRef.current?.focus();
        }
    }, [handleSaveEdit, currentRow?.value]);

    const patternWarning = useMemo(() => {
        if (!currentRow) return null;
        const val = currentRow.value;
        const isEmail = val.includes('@');
        const isUrl = val.includes('http') || val.includes('.com') || val.includes('.id');
        const isPhone = /[\d+]{5,}/.test(val);

        if (isEmail && !PATTERNS.email.test(val)) return "Potential invalid email format";
        if (isUrl && !PATTERNS.url.test(val)) return "Potential invalid URL format";
        if (isPhone && !PATTERNS.phone.test(val)) return "Potential invalid phone format";
        return null;
    }, [currentRow]);

    if (!currentRow) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">All Done!</h3>
                <p className="text-sm text-gray-500">You&apos;ve reviewed all items.</p>
            </div>
        );
    }

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === stats.total - 1;
    const alreadyChecked = currentRow.status !== 'unchecked';

    return (
        <div
            ref={cardRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="outline-none"
        >
            {/* Counter + Navigation */}
            <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onGoToPrev}
                        disabled={isFirst}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold text-gray-600 tabular-nums">
                        {currentIndex + 1} <span className="text-gray-300 font-normal">of</span> {stats.total}
                    </span>
                    <button
                        onClick={onGoToNext}
                        disabled={isLast}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {stats.unchecked > 0 && (
                    <button
                        onClick={onGoToNextUnchecked}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
                    >
                        <SkipForward className="w-3.5 h-3.5" />
                        Next unchecked
                    </button>
                )}

                {canUndo && (
                    <button
                        onClick={onUndo}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                        Undo
                    </button>
                )}
            </div>

            {/* The Big Card */}
            <div className={cn(
                "relative rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                currentRow.status === 'valid' && "border-emerald-300 bg-emerald-50/30",
                currentRow.status === 'invalid' && "border-red-300 bg-red-50/30",
                currentRow.status === 'unchecked' && "border-gray-200 bg-white",
            )}>
                {/* Status badge (if already checked) */}
                {alreadyChecked && (
                    <div className={cn(
                        "absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        currentRow.status === 'valid' && "bg-emerald-100 text-emerald-700",
                        currentRow.status === 'invalid' && "bg-red-100 text-red-700",
                    )}>
                        {currentRow.status === 'valid' ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Valid</>
                        ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Invalid</>
                        )}
                    </div>
                )}

                {/* Data Content */}
                <div className="px-8 pt-10 pb-6">
                    {isEditingValue ? (
                        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editValueText}
                                onChange={(e) => setEditValueText(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed bg-white border-2 border-primary-300 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-primary-100 transition-all w-full"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary-700 transition-all"
                                >
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditingValue(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative">
                            <p className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed break-words pr-12">
                                {currentRow.value}
                            </p>
                            <button
                                onClick={handleStartEditing}
                                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Edit value"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {patternWarning && !isEditingValue && (
                        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-lg animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-xs font-medium text-amber-700">{patternWarning}</p>
                        </div>
                    )}

                    {currentRow.comment && !isEditingValue && (
                        <div className="mt-4 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200/50 rounded-lg">
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-600">{currentRow.comment}</p>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="px-8 pb-8">
                    {!isCommentMode ? (
                        <div className="flex flex-col gap-3">
                            {/* BIG Valid Button */}
                            <button
                                onClick={handleMarkValid}
                                className={cn(
                                    "w-full flex items-center justify-center gap-3 py-5 rounded-xl text-lg font-bold transition-all duration-200 active:scale-[0.98]",
                                    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg",
                                    "focus-visible:ring-4 focus-visible:ring-emerald-300",
                                )}
                            >
                                <CheckCircle2 className="w-6 h-6" />
                                Valid
                                <kbd className="ml-2 px-2 py-0.5 bg-emerald-600/50 rounded text-xs font-mono opacity-70">Enter</kbd>
                            </button>

                            {/* Invalid Button */}
                            <button
                                onClick={() => setIsCommentMode(true)}
                                className={cn(
                                    "w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-semibold transition-all duration-200 active:scale-[0.98]",
                                    "bg-white hover:bg-red-50 text-red-500 border-2 border-red-200 hover:border-red-300",
                                    "focus-visible:ring-4 focus-visible:ring-red-200",
                                )}
                            >
                                <XCircle className="w-5 h-5" />
                                Invalid — Add Comment
                            </button>
                        </div>
                    ) : (
                        /* Comment Mode */
                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                            <div className="relative">
                                <textarea
                                    ref={commentInputRef}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={handleCommentKeyDown}
                                    placeholder="What's wrong with this data? (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 text-sm bg-white border-2 border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-300/50 focus:border-red-300 transition-all resize-none placeholder:text-gray-400"
                                />
                            </div>

                            {/* Quick Tags */}
                            <div className="flex flex-wrap gap-1.5 py-1">
                                {QUICK_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            onMarkInvalid(tag);
                                        }}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleInvalidSubmit}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold bg-red-500 hover:bg-red-600 text-white transition-all duration-200 active:scale-[0.98] shadow-md"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Mark Invalid
                                    <kbd className="ml-1 px-2 py-0.5 bg-red-600/50 rounded text-xs font-mono opacity-70">Enter</kbd>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCommentMode(false);
                                        setCommentText('');
                                    }}
                                    className="px-5 py-4 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 text-center">
                                Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Enter</kbd> to submit · <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Esc</kbd> to cancel
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard shortcuts hint */}
            {!isCommentMode && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <p className="text-[11px] text-gray-400 text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">Enter</kbd> Valid</span>
                        <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">E</kbd> Edit</span>
                        <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">Ctrl+Z</kbd> Undo</span>
                        <span><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">←→</kbd> Navigate</span>
                    </p>
                </div>
            )}
        </div>
    );
}
