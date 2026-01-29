'use client';

import { useState, useEffect } from 'react';
import { useHashGenerator } from '../hooks/use-hash-generator';
import { HASH_ALGORITHMS } from '../constants';
import { HashAlgorithm } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Settings2, ShieldCheck, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function HashGenerator() {
  const { options, result, isGenerating, updateOption } = useHashGenerator();
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compareHash, setCompareHash] = useState('');

  const currentAlgo = HASH_ALGORITHMS.find(a => a.id === options.algorithm);

  const handleCopy = () => {
    if (result?.hash) {
      navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isMatch = compareHash && result?.hash && compareHash === result.hash;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="input-text" className="text-lg font-semibold text-gray-700">Input Text</Label>
          <span className="text-sm text-gray-400">
            {options.text.length} characters
          </span>
        </div>
        <textarea
          id="input-text"
          value={options.text}
          onChange={(e) => updateOption('text', e.target.value)}
          placeholder="Type something to hash... (Instant update)"
          className="w-full min-h-[120px] p-4 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-y placeholder:text-gray-300 shadow-sm"
        />
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">

        {/* Algorithm Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-600">Hashing Algorithm</Label>
          <div className="grid grid-cols-2 gap-2">
            {HASH_ALGORITHMS.map((algo) => (
              <button
                key={algo.id}
                onClick={() => updateOption('algorithm', algo.id)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 text-left",
                  options.algorithm === algo.id
                    ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm ring-1 ring-primary-200"
                    : "bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {algo.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 min-h-[1.5em]">{currentAlgo?.description}</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Salt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="salt" className="text-sm font-medium text-gray-600">Salt (Optional)</Label>
              {currentAlgo?.isAsync && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">Async/Slow</span>}
            </div>
            <Input
              id="salt"
              value={options.salt}
              onChange={(e) => updateOption('salt', e.target.value)}
              placeholder="Add 'salt' to strengthen..."
              className="bg-gray-50/50"
            />
            <p className="text-[10px] text-gray-400">
              {options.algorithm === 'BCRYPT'
                ? "Note: Bcrypt generates a secure random salt internally. Custom salt input here is unused."
                : "Prepended to text before hashing."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3 pt-2"
              >
                {options.algorithm === 'BCRYPT' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Cost Factor ({options.cost})</Label>
                    <input
                      type="range"
                      min="4"
                      max="12" // higher is too slow for browser demo usually
                      value={options.cost}
                      onChange={(e) => updateOption('cost', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                )}
                {options.algorithm === 'ARGON2' && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Memory (KB)</Label>
                        <Input
                          type="number"
                          value={options.memory}
                          onChange={(e) => updateOption('memory', parseInt(e.target.value))}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Iterations</Label>
                        <Input
                          type="number"
                          value={options.iterations}
                          onChange={(e) => updateOption('iterations', parseInt(e.target.value))}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {!['BCRYPT', 'ARGON2'].includes(options.algorithm) && (
                  <p className="text-xs text-gray-400 italic">No advanced options for this algorithm.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Result Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary-500" />
            Result
          </h3>
          {result?.executionTime !== undefined && (
            <span className="text-xs text-mono text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {result.executionTime.toFixed(2)}ms
            </span>
          )}
        </div>

        <div className="relative group">
          <div className={cn(
            "w-full p-6 bg-slate-900 rounded-xl font-mono text-sm break-all shadow-lg min-h-[100px] flex items-center transition-colors duration-300",
            isGenerating ? "opacity-70" : "opacity-100",
            result?.error ? "text-red-400" : "text-emerald-400"
          )}>
            {isGenerating ? (
              <span className="animate-pulse">Generating hash...</span>
            ) : result?.error ? (
              result.error
            ) : (
              result?.hash || <span className="text-slate-600">Waiting for input...</span>
            )}
          </div>

          {result?.hash && !result.error && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className={cn("h-8 gap-2 bg-slate-700 hover:bg-slate-600 text-white border-0", copied && "text-emerald-400")}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>

        {/* Verification */}
        {result?.hash && !result.error && (
          <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <Label className="text-sm font-medium text-gray-500 mb-2 block">Compare with Hash</Label>
            <div className="relative">
              <Input
                value={compareHash}
                onChange={(e) => setCompareHash(e.target.value)}
                placeholder="Paste a hash here to verify..."
                className={cn(
                  "pr-10 transition-all duration-300",
                  compareHash && (isMatch ? "border-emerald-500 bg-emerald-50/30 text-emerald-700" : "border-red-300 bg-red-50/30 text-red-700")
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {compareHash && (
                  isMatch ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <div className="text-red-400 text-xs font-bold">MISS</div>
                )}
              </div>
            </div>
            {compareHash && isMatch && (
              <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Hash matches!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
