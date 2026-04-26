'use client';

import { useState, useRef } from 'react';
import { useSvgOptimizer } from '../hooks/use-svg-optimizer';
import { SAMPLE_SVG } from '../constants';
import { formatBytes } from '../lib/svg-optimizer-utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Zap,
  FileCode,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Eye,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type PreviewTab = 'code' | 'preview';

export function SvgOptimizer() {
  const {
    options,
    result,
    stats,
    isProcessing,
    isSvgoLoaded,
    isSvgoLoading,
    optimize,
    updateSvg,
    togglePlugin,
    enableAllPlugins,
    disableAllPlugins,
    toggleMultipass,
    reset,
    loadSample,
  } = useSvgOptimizer();

  const [copied, setCopied] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('code');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.output) return;
    const blob = new Blob([result.output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      updateSvg(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const enabledCount = options.plugins.filter((p) => p.enabled).length;

  const svgPreviewDataUrl = result?.output
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.output)}`
    : null;

  const originalPreviewDataUrl = options.svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(options.svg)}`
    : null;

  return (
    <div className="w-full">
      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">

          {/* LEFT PANEL: Input & Options */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white flex flex-col gap-5">

            {/* SVG Input */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="svg-input" className="text-sm font-semibold text-gray-800">
                  SVG Input
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium tabular-nums">
                    {options.svg.length.toLocaleString()} chars
                  </span>
                  <button
                    onClick={() => loadSample(SAMPLE_SVG)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Sample
                  </button>
                </div>
              </div>
              <textarea
                id="svg-input"
                value={options.svg}
                onChange={(e) => updateSvg(e.target.value)}
                placeholder="Paste your SVG code here..."
                spellCheck={false}
                className="w-full min-h-[220px] lg:min-h-[280px] p-4 text-[13px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload SVG file
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              {/* Multipass Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Multipass</p>
                  <p className="text-xs text-gray-400">Run optimization multiple times for better results</p>
                </div>
                <button
                  onClick={toggleMultipass}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none',
                    options.multipass ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm',
                      options.multipass ? 'translate-x-4' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Plugins Section */}
              <div>
                <button
                  onClick={() => setShowPlugins((v) => !v)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    Plugins
                    <span className="text-xs font-normal text-gray-400">
                      ({enabledCount}/{options.plugins.length} enabled)
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      showPlugins && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {showPlugins && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={enableAllPlugins}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                          >
                            Enable All
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={disableAllPlugins}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                          >
                            Disable All
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                          {options.plugins.map((plugin) => (
                            <label
                              key={plugin.name}
                              className="flex items-start gap-2.5 cursor-pointer group py-1"
                            >
                              <input
                                type="checkbox"
                                checked={plugin.enabled}
                                onChange={() => togglePlugin(plugin.name)}
                                className="mt-0.5 w-3.5 h-3.5 rounded text-primary-600 accent-primary-600 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-700 group-hover:text-primary-600 transition-colors leading-tight">
                                  {plugin.label}
                                </p>
                                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                                  {plugin.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={optimize}
                disabled={isProcessing || !options.svg.trim() || (!isSvgoLoaded && !isSvgoLoading)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              >
                {isProcessing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Optimizing...
                  </>
                ) : isSvgoLoading ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Loading SVGO...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize SVG
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

          {/* RIGHT PANEL: Output */}
          <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[400px]">
            <div className="flex flex-col h-full gap-4">

              {/* Output Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-0.5 bg-gray-100/80 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setPreviewTab('code')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                      previewTab === 'code'
                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Code
                  </button>
                  <button
                    onClick={() => setPreviewTab('preview')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                      previewTab === 'preview'
                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {result?.executionTime !== undefined && !result.error && result.output && (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />
                      {result.executionTime.toFixed(1)}ms
                    </span>
                  )}
                  {stats && result?.output && (
                    <span className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-full',
                      stats.compressionRatio > 0
                        ? 'text-success-600 bg-success-50'
                        : 'text-gray-600 bg-gray-100'
                    )}>
                      -{stats.compressionRatio.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Output Content */}
              <div className="flex-1 relative group">
                <AnimatePresence mode="wait">
                  {previewTab === 'code' ? (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <div className={cn(
                        'w-full h-full min-h-[280px] p-4 rounded-xl border font-mono text-[12px] leading-relaxed overflow-auto transition-all duration-300 whitespace-pre',
                        isProcessing
                          ? 'bg-white border-primary-200 text-gray-400'
                          : result?.error
                            ? 'bg-error-50 border-error-200 text-error-600'
                            : result?.output
                              ? 'bg-white border-gray-200 text-gray-700 shadow-sm'
                              : 'bg-white/50 border-dashed border-gray-200 text-gray-400'
                      )}>
                        {isProcessing ? (
                          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
                            </span>
                            <span className="text-xs font-medium">Optimizing...</span>
                          </div>
                        ) : result?.error ? (
                          <div className="flex flex-col items-center justify-center h-full gap-2">
                            <AlertCircle className="w-8 h-8 text-error-400 mb-2" />
                            <p className="font-semibold font-sans">Optimization Failed</p>
                            <p className="text-xs opacity-80 font-sans">{result.error}</p>
                          </div>
                        ) : result?.output ? (
                          result.output
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                            <FileCode className="w-8 h-8 text-gray-300" />
                            <p className="font-sans">Paste SVG and click Optimize...</p>
                          </div>
                        )}
                      </div>

                      {result?.output && !result.error && (
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
                              'h-8 gap-1.5 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all',
                              copied && 'text-success-600 border-success-500 bg-success-50'
                            )}
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <div className="w-full min-h-[280px] rounded-xl border border-gray-200 bg-white overflow-hidden">
                        {result?.output && originalPreviewDataUrl && svgPreviewDataUrl ? (
                          <div className="grid grid-cols-2 h-full divide-x divide-gray-100">
                            <div className="p-4 flex flex-col items-center gap-3">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                Before
                              </p>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={originalPreviewDataUrl}
                                alt="Original SVG preview"
                                className="max-w-full max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-4 flex flex-col items-center gap-3">
                              <p className="text-[11px] font-semibold text-primary-500 uppercase tracking-wider">
                                After
                              </p>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={svgPreviewDataUrl}
                                alt="Optimized SVG preview"
                                className="max-w-full max-h-40 object-contain"
                              />
                            </div>
                          </div>
                        ) : options.svg && originalPreviewDataUrl ? (
                          <div className="p-4 flex flex-col items-center gap-3 min-h-[280px] justify-center">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              Preview
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={originalPreviewDataUrl}
                              alt="SVG preview"
                              className="max-w-full max-h-48 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[280px] gap-2 text-gray-400 opacity-50">
                            <Eye className="w-8 h-8 text-gray-300" />
                            <p className="text-sm font-sans">No SVG to preview</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats Footer */}
              {stats && result?.output && !result.error && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                        Original
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {formatBytes(stats.originalSize)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                        Optimized
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatBytes(stats.resultSize)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                        Saved
                      </p>
                      <p className="text-sm font-semibold text-success-600">
                        {formatBytes(Math.abs(stats.sizeDiff))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                        Ratio
                      </p>
                      <p className="text-sm font-semibold text-success-600">
                        -{stats.compressionRatio.toFixed(1)}%
                      </p>
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
