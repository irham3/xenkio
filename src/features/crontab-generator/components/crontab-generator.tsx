'use client';

import { Clock, Sparkles, Terminal, RotateCcw, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CopyButton } from '@/components/shared';
import { useCrontabGenerator } from '../hooks/use-crontab-generator';
import { CronFieldEditor } from './cron-field-editor';
import { CRON_PRESETS } from '../lib/cron-utils';
import { CronFieldType } from '../types';

export function CrontabGenerator() {
    const {
        mode,
        setMode,
        config,
        parserInput,
        setParserInput,
        generatedExpression,
        humanReadable,
        nextExecutions,
        isValid,
        currentExpression,
        updateField,
        applyPreset,
        resetConfig,
    } = useCrontabGenerator();

    const cronFields: CronFieldType[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

    return (
        <div className="w-full space-y-8">
            {/* Mode Tabs */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-2">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setMode('generator')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
                            mode === 'generator'
                                ? "bg-primary-600 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <Sparkles className="h-4 w-4" />
                        Generator
                    </button>
                    <button
                        onClick={() => setMode('parser')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
                            mode === 'parser'
                                ? "bg-primary-600 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <Terminal className="h-4 w-4" />
                        Parser
                    </button>
                </div>
            </div>

            {/* Expression Display */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary-500" />
                        Cron Expression
                    </h3>
                    <div className="flex items-center gap-3">
                        {mode === 'generator' && (
                            <Button
                                onClick={resetConfig}
                                variant="outline"
                                className="rounded-xl h-11 border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-700 hover:text-primary-600 cursor-pointer"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        )}
                        <CopyButton
                            value={currentExpression}
                            label="Copy"
                            className="rounded-xl h-11 border border-gray-200 hover:bg-gray-50 transition-all font-medium text-gray-700 hover:text-primary-600"
                        />
                    </div>
                </div>

                {/* Expression output/input */}
                {mode === 'generator' ? (
                    <div className="bg-gray-900 rounded-xl p-6 text-center">
                        <p className="font-mono text-2xl md:text-4xl font-black text-white tracking-wider select-all">
                            {generatedExpression}
                        </p>
                        <div className="flex justify-center gap-4 mt-3">
                            {['MIN', 'HOUR', 'DOM', 'MON', 'DOW'].map((label) => (
                                <span key={label} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={parserInput}
                            onChange={(e) => setParserInput(e.target.value)}
                            placeholder="Enter cron expression, e.g. */5 * * * *"
                            className={cn(
                                "w-full h-16 bg-gray-900 rounded-xl px-6 text-center font-mono text-2xl md:text-3xl font-black text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all",
                                isValid ? "focus:ring-primary-500/30" : "focus:ring-red-500/30 ring-2 ring-red-500/30"
                            )}
                        />
                        <div className="flex justify-center gap-4">
                            {['MIN', 'HOUR', 'DOM', 'MON', 'DOW'].map((label) => (
                                <span key={label} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Human readable description */}
                <div className={cn(
                    "mt-6 p-4 rounded-xl border flex items-start gap-3",
                    isValid
                        ? "bg-primary-50/30 border-primary-200"
                        : "bg-red-50/30 border-red-200"
                )}>
                    {isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <p className={cn(
                        "text-sm font-medium",
                        isValid ? "text-primary-700" : "text-red-700"
                    )}>
                        {humanReadable}
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'generator' ? (
                    <motion.div
                        key="generator"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Field Editors */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Configure Fields</h3>
                                <div className="space-y-8">
                                    {cronFields.map((fieldType) => (
                                        <CronFieldEditor
                                            key={fieldType}
                                            fieldType={fieldType}
                                            field={config[fieldType]}
                                            onChange={updateField}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Presets Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary-500" />
                                    Quick Presets
                                </h3>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {CRON_PRESETS.map((preset) => (
                                        <button
                                            key={preset.expression}
                                            onClick={() => applyPreset(preset.expression)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl transition-all cursor-pointer group",
                                                generatedExpression === preset.expression
                                                    ? "bg-primary-50 border-2 border-primary-200"
                                                    : "hover:bg-gray-50 border-2 border-transparent"
                                            )}
                                        >
                                            <span className="text-sm font-bold text-gray-900 block">{preset.label}</span>
                                            <span className="text-xs font-mono text-gray-400 group-hover:text-primary-500 transition-colors">
                                                {preset.expression}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="parser"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Next Executions */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary-500" />
                                    Next Executions
                                </h3>
                                {nextExecutions.length > 0 ? (
                                    <div className="space-y-3">
                                        {nextExecutions.map((date, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-all group"
                                            >
                                                <span className="text-xs font-black text-primary-500 bg-primary-50 px-2.5 py-1 rounded-lg">
                                                    #{idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {date.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        {date.toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-sm font-medium">
                                            {parserInput.trim() ? 'Invalid cron expression' : 'Enter a cron expression to see next executions'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Examples Sidebar */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-primary-500" />
                                    Examples
                                </h3>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {CRON_PRESETS.map((preset) => (
                                        <button
                                            key={preset.expression}
                                            onClick={() => setParserInput(preset.expression)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl transition-all cursor-pointer group",
                                                parserInput === preset.expression
                                                    ? "bg-primary-50 border-2 border-primary-200"
                                                    : "hover:bg-gray-50 border-2 border-transparent"
                                            )}
                                        >
                                            <span className="text-sm font-bold text-gray-900 block">{preset.label}</span>
                                            <span className="text-xs font-mono text-gray-400 group-hover:text-primary-500 transition-colors">
                                                {preset.expression}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
