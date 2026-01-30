'use client';

import { useState } from 'react';
import { verifyHash as verifyHashUtil } from '../lib/hash-utils';
import { useHashGenerator } from '../hooks/use-hash-generator';
import { HASH_ALGORITHMS } from '../constants';
import { HashAlgorithm } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ChevronDown, ShieldCheck, ShieldX, Zap, Hash, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabMode = 'generate' | 'verify';

export function HashGenerator() {
  const { options, result, isGenerating, updateOption, generate } = useHashGenerator();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('generate');

  // Verify tab state
  const [verifyText, setVerifyText] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyAlgorithm, setVerifyAlgorithm] = useState(options.algorithm);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // const currentAlgo = HASH_ALGORITHMS.find(a => a.id === options.algorithm);
  // const verifyAlgo = HASH_ALGORITHMS.find(a => a.id === verifyAlgorithm);

  const handleCopy = () => {
    if (result?.hash) {
      navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (!verifyHash || !verifyText) {
      setIsMatch(null);
      return;
    }

    setIsVerifying(true);
    try {
      const match = await verifyHashUtil(verifyText, verifyHash, verifyAlgorithm);
      setIsMatch(match);
    } catch {
      setIsMatch(false);
    } finally {
      setIsVerifying(false);
    }
  };



  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'generate'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          {/* <Hash className="w-4 h-4" /> */}
          Generate
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'verify'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          {/* <FileCheck className="w-4 h-4" /> */}
          Verify
        </button>
      </div>

      {/* Main Tool Area - Consistent Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        <div className="grid lg:grid-cols-5 gap-0">

          {/* LEFT PANEL: Inputs & Options */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'generate' ? (
                <motion.div
                  key="generate-inputs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Text Input */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="input-text" className="text-sm font-semibold text-gray-800">
                        Input Text
                      </Label>
                      <span className="text-xs text-gray-400 font-medium tabular-nums">
                        {options.text.length} chars
                      </span>
                    </div>
                    <textarea
                      id="input-text"
                      value={options.text}
                      onChange={(e) => updateOption('text', e.target.value)}
                      placeholder="Type something to hash..."
                      className="w-full min-h-[120px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Algorithm Select Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Algorithm</Label>
                    <div className="relative">
                      <select
                        value={options.algorithm}
                        onChange={(e) => updateOption('algorithm', e.target.value as HashAlgorithm)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                      >
                        {HASH_ALGORITHMS.map((algo) => (
                          <option key={algo.id} value={algo.id}>
                            {algo.name} {algo.isAsync ? '(Slow/Secure)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                    {/* <p className="text-[12px] text-gray-500 leading-snug">
                      {currentAlgo?.description}
                    </p> */}
                  </div>

                  {/* Dynamic Options based on Algorithm */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">

                    {/* BCRYPT OPTIONS */}
                    {options.algorithm === 'BCRYPT' && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">Cost Factor</Label>
                            <span className="text-xs font-mono font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                              {options.cost ?? 10}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="30"
                            step="1"
                            value={options.cost ?? 10}
                            onChange={(e) => updateOption('cost', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                          />
                          <div className="flex justify-between mt-1 text-[12px] text-gray-400">
                            <span>4 (Fast)</span>
                            <span className={(options.cost ?? 10) > 12 ? "text-amber-500 font-medium" : ""}>
                              {options.cost && options.cost > 14 ? "Very Slow!" : "12 (Standard)"}
                            </span>
                            <span>30 (Max)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ARGON2 OPTIONS */}
                    {options.algorithm === 'ARGON2' && (
                      <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="space-y-1">
                          <Label className="text-[12px] font-medium text-gray-500 uppercase">Memory (KB)</Label>
                          <Input
                            type="number"
                            value={options.memory}
                            onChange={(e) => updateOption('memory', parseInt(e.target.value))}
                            className="h-9 bg-gray-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[12px] font-medium text-gray-500 uppercase">Iterations</Label>
                          <Input
                            type="number"
                            value={options.iterations}
                            onChange={(e) => updateOption('iterations', parseInt(e.target.value))}
                            className="h-9 bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* SALT INPUT (Hidden for Bcrypt) */}
                    {options.algorithm !== 'BCRYPT' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <Label htmlFor="salt" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          Salt <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id="salt"
                          value={options.salt}
                          onChange={(e) => updateOption('salt', e.target.value)}
                          placeholder={options.algorithm === 'ARGON2' ? "Optional random salt..." : "Append custom salt..."}
                          className="bg-gray-50 focus:bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={generate}
                      disabled={isGenerating || !options.text}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Hash
                        </>
                      )}
                    </Button>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="verify-inputs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Verify Text Input */}
                  <div className="space-y-2">
                    <Label htmlFor="verify-text" className="text-sm font-semibold text-gray-800">
                      Original Text
                    </Label>
                    <textarea
                      id="verify-text"
                      value={verifyText}
                      onChange={(e) => {
                        setVerifyText(e.target.value);
                        updateOption('text', e.target.value);
                        setIsMatch(null);
                      }}
                      placeholder="Enter the original text..."
                      className="w-full min-h-[100px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Verify Algorithm Select */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Algorithm</Label>
                    <div className="relative">
                      <select
                        value={verifyAlgorithm}
                        onChange={(e) => {
                          setVerifyAlgorithm(e.target.value as HashAlgorithm);
                          updateOption('algorithm', e.target.value as HashAlgorithm);
                          setIsMatch(null);
                        }}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                      >
                        {HASH_ALGORITHMS.map((algo) => (
                          <option key={algo.id} value={algo.id}>
                            {algo.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                  </div>

                  {/* Hash to Verify Input */}
                  <div className="space-y-2">
                    <Label htmlFor="verify-hash" className="text-sm font-semibold text-gray-800">
                      Target Hash
                    </Label>
                    <Input
                      id="verify-hash"
                      value={verifyHash}
                      onChange={(e) => {
                        setVerifyHash(e.target.value);
                        setIsMatch(null);
                      }}
                      placeholder="Paste hash here..."
                      className={cn(
                        "bg-gray-50 focus:bg-white font-mono text-sm",
                        verifyHash && isMatch !== null && (isMatch
                          ? "border-success-500 focus:ring-success-500/20"
                          : "border-error-500 focus:ring-error-500/20")
                      )}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying || !verifyText || !verifyHash}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                    >
                      {isVerifying ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Verify Hash
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL: Output & Results */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px] border-l border-gray-100">

            {activeTab === 'generate' ? (
              <div className="flex flex-col h-auto"> {/* Changed h-full to h-auto */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Generated Hash</h3>
                  {result?.executionTime !== undefined && !result.error && (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <Zap className="w-3 h-3" />
                      {result.executionTime.toFixed(1)}ms
                    </span>
                  )}
                </div>

                <div className="flex-1 relative group">
                  <div className={cn(
                    "w-full min-h-[120px] p-5 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300", /* Changed min-h-250 to min-h-120 and removed h-full */
                    isGenerating
                      ? "bg-white border-primary-200 text-gray-400"
                      : result?.error
                        ? "bg-error-50 border-error-200 text-error-600"
                        : result?.hash
                          ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                          : "bg-white/50 border-dashed border-gray-200 text-gray-400"
                  )}>
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                        </span>
                        <span className="text-xs font-medium">Computing hash...</span>
                      </div>
                    ) : result?.error ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <ShieldX className="w-8 h-8 text-error-400 mb-2" />
                        <p className="font-semibold">Error Generation Failed</p>
                        <p className="text-xs opacity-80">{result.error}</p>
                      </div>
                    ) : result?.hash ? (
                      result.hash
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                        <Hash className="w-8 h-8 text-gray-300" />
                        <p>Waiting for input...</p>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  {result?.hash && !result.error && (
                    <div className="absolute top-3 right-3">
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
              </div>
            ) : (
              <div className="flex flex-col h-full justify-center">
                {isVerifying ? (
                  <div className="flex flex-col items-center justify-center p-8 opacity-60">
                    <span className="relative flex h-8 w-8 mb-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-500 justify-center items-center">
                        <Zap className="w-4 h-4 text-white" />
                      </span>
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Verifying...</h3>
                    <p className="text-xs text-gray-500">Comparing cryptographic signatures</p>
                  </div>
                ) : isMatch !== null ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-8 rounded-2xl border-2 text-center transition-all duration-300 bg-white shadow-sm mx-auto w-full max-w-sm",
                      isMatch
                        ? "border-success-200 ring-4 ring-success-50"
                        : "border-error-200 ring-4 ring-error-50"
                    )}
                  >
                    <div className={cn(
                      "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm",
                      isMatch ? "bg-success-100 text-success-600" : "bg-error-100 text-error-600"
                    )}>
                      {isMatch
                        ? <ShieldCheck className="w-10 h-10" />
                        : <ShieldX className="w-10 h-10" />
                      }
                    </div>

                    <h4 className={cn(
                      "text-xl font-bold mb-2 tracking-tight",
                      isMatch ? "text-success-700" : "text-error-700"
                    )}>
                      {isMatch ? "Match Confirmed" : "Match Failed"}
                    </h4>

                    <p className={cn(
                      "text-sm font-medium leading-relaxed",
                      isMatch ? "text-success-600/80" : "text-error-600/80"
                    )}>
                      {isMatch
                        ? "The provided hash is valid for the given text."
                        : "The provided hash does not match the original text."
                      }
                    </p>

                    {!isMatch && result?.hash && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-[12px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Expected Hash</p>
                        <div className="bg-gray-50 p-2 rounded text-[12px] font-mono text-gray-500 break-all select-all">
                          {result.hash}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center text-center p-8 opacity-60">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready to Verify</h3>
                    <p className="text-xs text-gray-500 max-w-[200px]">Enter original text and the hash to compare them instantly.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
