'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTimestampConverter } from '../hooks/use-timestamp-converter';
import { COMMON_TIMEZONES, QUICK_TIMESTAMPS } from '../constants';
import { parseDateString, formatTimestampDisplay } from '../lib/timestamp-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  ChevronDown,
  Clock,
  Calendar,
  ArrowRightLeft,
  Zap,
  RefreshCw,
  Globe,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabMode = 'timestamp-to-date' | 'date-to-timestamp';

interface CopyButtonProps {
  text: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

function CopyButton({ text, field, copiedField, onCopy }: CopyButtonProps) {
  return (
    <button
      onClick={() => onCopy(text, field)}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100",
        copiedField === field ? "text-success-600 bg-success-50" : "text-gray-400 hover:text-gray-600"
      )}
      title="Copy"
    >
      {copiedField === field ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function TimestampConverter() {
  const {
    options,
    result,
    liveTimestamp,
    updateOption,
    setToNow,
    setTimestamp,
    toggleUnit,
  } = useTimestampConverter();

  const [activeTab, setActiveTab] = useState<TabMode>('timestamp-to-date');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Date to timestamp state
  const [dateInput, setDateInput] = useState('');

  // Compute date result from input (using useMemo instead of useEffect + setState)
  const dateResult = useMemo(() => {
    if (!dateInput.trim()) {
      return null;
    }

    const parsed = parseDateString(dateInput);
    if (parsed.isValid) {
      return {
        timestamp: Math.floor(parsed.ms / 1000),
        timestampMs: parsed.ms,
        isValid: true,
      };
    } else {
      return {
        timestamp: 0,
        timestampMs: 0,
        isValid: false,
        error: parsed.error,
      };
    }
  }, [dateInput]);

  const handleCopy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleSetNowDate = useCallback(() => {
    const now = new Date();
    setDateInput(now.toISOString().slice(0, 16));
  }, []);

  return (
    <div className="w-full">
      {/* Live Timestamp Display */}
      <div className="mb-6 p-4 bg-linear-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
              <Timer className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Current Unix Timestamp</p>
              <p className="text-xl font-bold text-gray-900 font-mono tracking-tight">
                {formatTimestampDisplay(liveTimestamp)}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(liveTimestamp.toString(), 'live')}
            className={cn(
              "h-9 gap-1.5 text-xs font-medium border-gray-200 bg-white",
              copiedField === 'live' && "text-success-600 border-success-300 bg-success-50"
            )}
          >
            {copiedField === 'live' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedField === 'live' ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 max-w-md border border-gray-200">
        <button
          onClick={() => setActiveTab('timestamp-to-date')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'timestamp-to-date'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Clock className="w-4 h-4" />
          Timestamp → Date
        </button>
        <button
          onClick={() => setActiveTab('date-to-timestamp')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'date-to-timestamp'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Calendar className="w-4 h-4" />
          Date → Timestamp
        </button>
      </div>

      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-5 gap-0">

          {/* LEFT PANEL: Inputs */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'timestamp-to-date' ? (
                <motion.div
                  key="timestamp-inputs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Timestamp Input */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="timestamp-input" className="text-sm font-semibold text-gray-800">
                        Unix Timestamp
                      </Label>
                      <button
                        onClick={toggleUnit}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        {options.unit === 'seconds' ? 'Seconds' : 'Milliseconds'}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="timestamp-input"
                        type="text"
                        inputMode="numeric"
                        value={options.timestamp}
                        onChange={(e) => updateOption('timestamp', e.target.value.replace(/[^0-9-]/g, ''))}
                        placeholder={options.unit === 'seconds' ? '1706620800' : '1706620800000'}
                        className="font-mono text-base pr-20 bg-gray-50 focus:bg-white h-12"
                      />
                      <Button
                        size="sm"
                        onClick={setToNow}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 text-xs gap-1.5 bg-primary-500 hover:bg-primary-600"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Now
                      </Button>
                    </div>
                  </div>

                  {/* Quick Timestamps */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quick Select</Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TIMESTAMPS.map((qt) => (
                        <button
                          key={qt.label}
                          onClick={() => setTimestamp(qt.getValue())}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 transition-all"
                        >
                          {qt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone Select */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      Timezone
                    </Label>
                    <div className="relative">
                      <select
                        value={options.timezone}
                        onChange={(e) => updateOption('timezone', e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                      >
                        {COMMON_TIMEZONES.map((tz) => (
                          <option key={tz.id} value={tz.id}>
                            {tz.name} ({tz.offset})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="date-inputs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Date Input */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="date-input" className="text-sm font-semibold text-gray-800">
                        Date & Time
                      </Label>
                      <button
                        onClick={handleSetNowDate}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Set to Now
                      </button>
                    </div>
                    <Input
                      id="date-input"
                      type="datetime-local"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="bg-gray-50 focus:bg-white h-12 text-base"
                    />
                    <p className="text-xs text-gray-500">
                      Or enter any date format (ISO 8601, RFC 2822, etc.)
                    </p>
                  </div>

                  {/* Text Date Input */}
                  <div className="space-y-2">
                    <Label htmlFor="text-date-input" className="text-sm font-medium text-gray-700">
                      Or Enter Date String
                    </Label>
                    <Input
                      id="text-date-input"
                      type="text"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      placeholder="2026-01-30T14:30:00Z"
                      className="font-mono text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Preset Dates */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-medium text-gray-700">Common Dates</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDateInput('1970-01-01T00:00:00Z')}
                        className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 transition-all text-left"
                      >
                        <span className="block text-gray-800">Unix Epoch</span>
                        <span className="text-gray-400">Jan 1, 1970</span>
                      </button>
                      <button
                        onClick={() => setDateInput('2000-01-01T00:00:00Z')}
                        className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 transition-all text-left"
                      >
                        <span className="block text-gray-800">Y2K</span>
                        <span className="text-gray-400">Jan 1, 2000</span>
                      </button>
                      <button
                        onClick={() => setDateInput('2038-01-19T03:14:07Z')}
                        className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-200 transition-all text-left"
                      >
                        <span className="block text-gray-800">Y2K38 Problem</span>
                        <span className="text-gray-400">Jan 19, 2038</span>
                      </button>
                      <button
                        onClick={handleSetNowDate}
                        className="px-3 py-2 text-xs font-medium bg-primary-50 hover:bg-primary-100 text-primary-600 hover:text-primary-700 rounded-lg border border-primary-200 transition-all text-left"
                      >
                        <span className="block">Current Time</span>
                        <span className="text-primary-400">Right now</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL: Output */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[400px] border-l border-gray-100">
            <AnimatePresence mode="wait">
              {activeTab === 'timestamp-to-date' ? (
                <motion.div
                  key="timestamp-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {!result ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">Enter a Timestamp</h3>
                      <p className="text-xs text-gray-500 max-w-[200px]">
                        Enter a Unix timestamp to see it converted to human-readable formats.
                      </p>
                    </div>
                  ) : !result.isValid ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-error-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-error-700 mb-1">Invalid Timestamp</h3>
                      <p className="text-xs text-error-500">{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-800">Converted Date & Time</h3>

                      {/* Main Display */}
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-center mb-4">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            {result.formatted.date}
                          </p>
                          <p className="text-lg text-gray-600 font-medium">
                            {result.formatted.time}
                          </p>
                          <p className="text-sm text-primary-600 font-medium mt-2">
                            {result.relative}
                          </p>
                        </div>
                      </div>

                      {/* Format Grid */}
                      <div className="grid gap-3">
                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Seconds</span>
                              <CopyButton text={result.timestamp.toString()} field="seconds" copiedField={copiedField} onCopy={handleCopy} />
                            </div>
                            <p className="text-sm font-mono text-gray-900 break-all">
                              {result.timestamp}
                            </p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Milliseconds</span>
                              <CopyButton text={result.timestampMs.toString()} field="ms" copiedField={copiedField} onCopy={handleCopy} />
                            </div>
                            <p className="text-sm font-mono text-gray-900 break-all">
                              {result.timestampMs}
                            </p>
                          </div>
                        </div>

                        {/* ISO 8601 */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">ISO 8601</span>
                            <CopyButton text={result.iso} field="iso" copiedField={copiedField} onCopy={handleCopy} />
                          </div>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {result.iso}
                          </p>
                        </div>

                        {/* UTC String */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">UTC String</span>
                            <CopyButton text={result.utc} field="utc" copiedField={copiedField} onCopy={handleCopy} />
                          </div>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {result.utc}
                          </p>
                        </div>

                        {/* Full Formatted */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                              {options.timezone}
                            </span>
                            <CopyButton text={result.formatted.full} field="full" copiedField={copiedField} onCopy={handleCopy} />
                          </div>
                          <p className="text-sm font-mono text-gray-900 break-all">
                            {result.formatted.full}
                          </p>
                        </div>
                      </div>

                      {result.error && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          ⚠️ {result.error}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="date-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {!dateResult ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">Enter a Date</h3>
                      <p className="text-xs text-gray-500 max-w-[200px]">
                        Select or enter a date to convert it to Unix timestamp.
                      </p>
                    </div>
                  ) : !dateResult.isValid ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-error-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-error-700 mb-1">Invalid Date</h3>
                      <p className="text-xs text-error-500">{dateResult.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-800">Unix Timestamp</h3>

                      {/* Main Timestamp Display */}
                      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
                        <p className="text-3xl font-bold text-gray-900 font-mono tracking-tight mb-3">
                          {formatTimestampDisplay(dateResult.timestamp)}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">seconds since Unix Epoch</p>
                        <Button
                          onClick={() => handleCopy(dateResult.timestamp.toString(), 'result-seconds')}
                          className={cn(
                            "gap-2",
                            copiedField === 'result-seconds' && "bg-success-600 hover:bg-success-700"
                          )}
                        >
                          {copiedField === 'result-seconds' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedField === 'result-seconds' ? 'Copied!' : 'Copy Timestamp'}
                        </Button>
                      </div>

                      {/* Both Formats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Seconds</span>
                            <CopyButton text={dateResult.timestamp.toString()} field="date-seconds" copiedField={copiedField} onCopy={handleCopy} />
                          </div>
                          <p className="text-lg font-mono text-gray-900 font-semibold">
                            {dateResult.timestamp}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Milliseconds</span>
                            <CopyButton text={dateResult.timestampMs.toString()} field="date-ms" copiedField={copiedField} onCopy={handleCopy} />
                          </div>
                          <p className="text-lg font-mono text-gray-900 font-semibold">
                            {dateResult.timestampMs}
                          </p>
                        </div>
                      </div>

                      {/* Quick Reference */}
                      <div className="p-4 bg-gray-100/50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">
                          <strong>Tip:</strong> Most programming languages use milliseconds (JavaScript, Java),
                          while Unix systems and databases often use seconds (MySQL, PostgreSQL).
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
