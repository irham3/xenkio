'use client';

import { useState } from 'react';
import { useHtmlEntityEncoder } from '../hooks/use-html-entity-encoder';
import { SAMPLE_HTML } from '../constants';
import { EntityMode } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  Zap,
  Code2,
  FileCode,
  Minimize2,
  RotateCcw,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HtmlEntityEncoder() {
  const {
    options,
    result,
    stats,
    isProcessing,
    updateInput,
    encode,
    decode,
    reset,
    loadSample,
  } = useHtmlEntityEncoder();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<EntityMode>('encode');

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.output) return;

    const blob = new Blob([result.output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'encode' ? 'encoded.html' : 'decoded.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAction = () => {
    if (activeTab === 'encode') {
      encode();
    } else {
      decode();
    }
  };

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
        <button
          onClick={() => setActiveTab('encode')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'encode'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Minimize2 className="w-4 h-4" />
          Encode
        </button>
        <button
          onClick={() => setActiveTab('decode')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'decode'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Code2 className="w-4 h-4" />
          Decode
        </button>
      </div>

      {/* Main Tool Area */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-2 gap-0">

          {/* LEFT PANEL: Input */}
          <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-5">
              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="html-input" className="text-sm font-semibold text-gray-800">
                    {activeTab === 'encode' ? 'HTML Input' : 'Encoded Input'}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                      {options.input.length.toLocaleString()} chars
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
                  value={options.input}
                  onChange={(e) => updateInput(e.target.value)}
                  placeholder={activeTab === 'encode' ? 'Paste your HTML here...' : 'Paste encoded HTML entities here...'}
                  spellCheck={false}
                  className="w-full min-h-[200px] lg:min-h-[280px] p-4 text-[13px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAction}
                  disabled={isProcessing || !options.input.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      {activeTab === 'encode' ? 'Encoding...' : 'Decoding...'}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {activeTab === 'encode' ? 'Encode HTML' : 'Decode HTML'}
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
                  {activeTab === 'encode' ? 'Encoded Output' : 'Decoded Output'}
                </h3>
                <div className="flex items-center gap-2">
                  {result?.executionTime !== undefined && !result.error && result.output && (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />
                      {result.executionTime.toFixed(1)}ms
                    </span>
                  )}
                  {stats && result?.output && (
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full",
                      stats.sizeDiff > 0
                        ? "text-amber-600 bg-amber-50"
                        : stats.sizeDiff < 0
                          ? "text-success-600 bg-success-50"
                          : "text-gray-600 bg-gray-100"
                    )}>
                      {stats.sizeDiff > 0 ? '+' : ''}{stats.sizeDiff.toLocaleString()} chars
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 relative group">
                <div className={cn(
                  "w-full h-full min-h-[280px] p-4 rounded-xl border font-mono text-[12px] leading-relaxed overflow-auto transition-all duration-300 whitespace-pre-wrap break-all",
                  isProcessing
                    ? "bg-white border-primary-200 text-gray-400"
                    : result?.error
                      ? "bg-error-50 border-error-200 text-error-600"
                      : result?.output
                        ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                        : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                )}>
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </span>
                      <span className="text-xs font-medium">
                        {activeTab === 'encode' ? 'Encoding...' : 'Decoding...'}
                      </span>
                    </div>
                  ) : result?.error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <AlertCircle className="w-8 h-8 text-error-400 mb-2" />
                      <p className="font-semibold font-sans">Processing Failed</p>
                      <p className="text-xs opacity-80 font-sans">{result.error}</p>
                    </div>
                  ) : result?.output ? (
                    result.output
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                      <FileCode className="w-8 h-8 text-gray-300" />
                      <p className="font-sans">Paste HTML and click {activeTab === 'encode' ? 'Encode' : 'Decode'}...</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
              {stats && result?.output && !result.error && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Original</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.originalChars.toLocaleString()} chars</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Result</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.resultChars.toLocaleString()} chars</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Entities</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.entitiesCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Size Diff</p>
                      <p className="text-sm font-semibold text-gray-700">{stats.sizeDiff > 0 ? '+' : ''}{stats.sizeDiff}</p>
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
