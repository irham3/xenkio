'use client';

import { useState } from 'react';
import { useHtmlFormatter } from '../hooks/use-html-formatter';
import { INDENT_TYPES, INDENT_SIZES, WRAP_LINE_LENGTHS, WRAP_ATTRIBUTES_OPTIONS, SAMPLE_HTML } from '../constants';
import { IndentType, IndentSize, WrapLineLength, HtmlFormatterOptions } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  Zap, 
  Code2, 
  Minimize2, 
  RotateCcw, 
  FileCode, 
  Download,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabMode = 'format' | 'minify';

export function HtmlFormatter() {
  const {
    options,
    result,
    stats,
    isFormatting,
    validationError,
    updateOption,
    format,
    minify,
    reset,
    loadSample,
  } = useHtmlFormatter();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('format');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopy = () => {
    if (result?.formatted) {
      navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.formatted) return;
    
    const blob = new Blob([result.formatted], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMinify = () => {
    setActiveTab('minify');
    minify();
  };

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 max-w-xs border border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'format'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Code2 className="w-4 h-4" />
          Format
        </button>
        <button
          onClick={handleMinify}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'minify'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Minimize2 className="w-4 h-4" />
          Minify
        </button>
      </div>

      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">

          {/* LEFT PANEL: Input & Options */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-5">
              {/* HTML Input */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="html-input" className="text-sm font-semibold text-gray-800">
                    HTML Input
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                      {options.html.length.toLocaleString()} chars
                    </span>
                    <button
                      onClick={() => loadSample(SAMPLE_HTML)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      Load Sample
                    </button>
                  </div>
                </div>
                <textarea
                  id="html-input"
                  value={options.html}
                  onChange={(e) => updateOption('html', e.target.value)}
                  placeholder="Paste your HTML code here..."
                  spellCheck={false}
                  className={cn(
                    "w-full min-h-[200px] lg:min-h-[280px] p-4 text-[13px] font-mono leading-relaxed bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400",
                    validationError ? "border-amber-300 focus:border-amber-400" : "border-gray-200"
                  )}
                />
                {validationError && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{validationError}</p>
                  </div>
                )}
              </div>

              {/* Quick Options */}
              <AnimatePresence mode="wait">
                {activeTab === 'format' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      {/* Indent Type & Size */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Indent</Label>
                          <div className="relative">
                            <select
                              value={options.indentType}
                              onChange={(e) => updateOption('indentType', e.target.value as IndentType)}
                              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                            >
                              {INDENT_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Size</Label>
                          <div className="relative">
                            <select
                              value={options.indentSize}
                              onChange={(e) => updateOption('indentSize', parseInt(e.target.value) as IndentSize)}
                              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                            >
                              {INDENT_SIZES.map((size) => (
                                <option key={size.id} value={size.id}>
                                  {size.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options Toggle */}
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          showAdvanced && "rotate-90"
                        )} />
                        Advanced Options
                      </button>

                      {/* Advanced Options */}
                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {/* Wrap Line Length */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Wrap Line at</Label>
                              <div className="relative">
                                <select
                                  value={options.wrapLineLength}
                                  onChange={(e) => updateOption('wrapLineLength', parseInt(e.target.value) as WrapLineLength)}
                                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                                >
                                  {WRAP_LINE_LENGTHS.map((length) => (
                                    <option key={length.id} value={length.id}>
                                      {length.label} {length.id > 0 && 'characters'}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                            </div>

                            {/* Wrap Attributes */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Wrap Attributes</Label>
                              <div className="relative">
                                <select
                                  value={options.wrapAttributes}
                                  onChange={(e) => updateOption('wrapAttributes', e.target.value as HtmlFormatterOptions['wrapAttributes'])}
                                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                                >
                                  {WRAP_ATTRIBUTES_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                              <p className="text-[11px] text-gray-500">
                                {WRAP_ATTRIBUTES_OPTIONS.find(o => o.id === options.wrapAttributes)?.description}
                              </p>
                            </div>

                            {/* Preserve Newlines */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <Label className="text-sm font-medium text-gray-700 cursor-pointer" htmlFor="preserve-newlines">
                                Preserve Newlines
                              </Label>
                              <button
                                id="preserve-newlines"
                                role="switch"
                                aria-checked={options.preserveNewlines}
                                onClick={() => updateOption('preserveNewlines', !options.preserveNewlines)}
                                className={cn(
                                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                  options.preserveNewlines ? "bg-primary-600" : "bg-gray-300"
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                                    options.preserveNewlines ? "translate-x-6" : "translate-x-1"
                                  )}
                                />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={format}
                  disabled={isFormatting || !options.html.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                >
                  {isFormatting ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      Formatting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Format HTML
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="h-9 gap-1.5 text-xs font-medium border-gray-200 hover:bg-gray-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Output */}
          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  {activeTab === 'format' ? 'Formatted HTML' : 'Minified HTML'}
                </h3>
                <div className="flex items-center gap-2">
                  {result?.executionTime !== undefined && !result.error && result.formatted && (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />
                      {result.executionTime.toFixed(1)}ms
                    </span>
                  )}
                  {stats && result?.formatted && (
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full",
                      stats.sizeDiff > 0 
                        ? "text-amber-600 bg-amber-50" 
                        : stats.sizeDiff < 0 
                          ? "text-success-600 bg-success-50"
                          : "text-gray-600 bg-gray-100"
                    )}>
                      {stats.sizeDiff > 0 ? '+' : ''}{stats.sizeDiff.toLocaleString()} bytes
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 relative group">
                <div className={cn(
                  "w-full h-full min-h-[280px] p-4 rounded-xl border font-mono text-[12px] leading-relaxed overflow-auto transition-all duration-300 whitespace-pre",
                  isFormatting
                    ? "bg-white border-primary-200 text-gray-400"
                    : result?.error
                      ? "bg-error-50 border-error-200 text-error-600"
                      : result?.formatted
                        ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                        : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                )}>
                  {isFormatting ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </span>
                      <span className="text-xs font-medium">Formatting...</span>
                    </div>
                  ) : result?.error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <AlertCircle className="w-8 h-8 text-error-400 mb-2" />
                      <p className="font-semibold font-sans">Formatting Failed</p>
                      <p className="text-xs opacity-80 font-sans">{result.error}</p>
                    </div>
                  ) : result?.formatted ? (
                    result.formatted
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                      <FileCode className="w-8 h-8 text-gray-300" />
                      <p className="font-sans">Paste HTML to format...</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {result?.formatted && !result.error && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                      className="h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-gray-50 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className={cn(
                        "h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all",
                        copied && "text-success-600 border-success-500 bg-success-50"
                      )}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              {stats && result?.formatted && !result.error && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Original</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.originalLines} lines</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Formatted</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.formattedLines} lines</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Original Size</p>
                      <p className="text-sm font-semibold text-gray-700">{(stats.originalSize / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">New Size</p>
                      <p className="text-sm font-semibold text-gray-700">{(stats.formattedSize / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
