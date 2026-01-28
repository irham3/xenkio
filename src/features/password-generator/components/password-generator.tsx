'use client';

import { useState } from 'react';
import { usePasswordGenerator } from '../hooks/use-password-generator';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Check, ShieldAlert, Shield, History, Settings2, Lock, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateStrength } from '../lib/password-utils';

export function PasswordGenerator() {
  const { config, updateConfig, password, strength, history, generate } = usePasswordGenerator();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'strong': return 'bg-success-500';
      case 'good': return 'bg-primary-500';
      case 'fair': return 'bg-accent-400';
      case 'weak': return 'bg-error-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthTextColor = (level: string) => {
    switch (level) {
      case 'strong': return 'text-success-600';
      case 'good': return 'text-primary-600';
      case 'fair': return 'text-accent-500';
      case 'weak': return 'text-error-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">

        {/* HERO: Password Display */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Progress bar top accent */}
          <div className="h-1.5 w-full bg-gray-50">
            <motion.div
              className={cn("h-full", getStrengthColor(strength.level))}
              initial={{ width: 0 }}
              animate={{ width: `${(strength.score + 1) * 20}%` }}
              transition={{ duration: 0.5, type: "spring" }}
            />
          </div>

          <div className="p-8 md:p-10 text-center relative group">
            <motion.div
              key={password}
              initial={{ opacity: 0.5, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-3xl md:text-5xl font-bold tracking-wider text-gray-800 break-all cursor-pointer selection:bg-primary-100 selection:text-primary-900 leading-tight"
              onClick={handleCopy}
              title="Click to copy"
            >
              {password}
            </motion.div>

            <div className="mt-8 flex justify-center gap-4">
              <Button
                size="lg"
                onClick={generate}
                className="rounded-xl px-6 h-12 bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md"
              >
                <RefreshCw className={cn("mr-2 h-5 w-5", "group-hover:rotate-180 transition-transform duration-500")} />
                Regenerate
              </Button>

              <Button
                size="lg"
                onClick={handleCopy}
                className={cn(
                  "rounded-xl px-8 h-12 font-semibold transition-all shadow-sm hover:shadow-md min-w-[140px]",
                  copied
                    ? "bg-success-100 text-success-700 border-2 border-success-200 hover:bg-success-200"
                    : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Strength Text */}
            <div className="mt-6 flex flex-col items-center">
              <span className={cn("text-sm font-bold uppercase tracking-widest mb-1", getStrengthTextColor(strength.level))}>
                {strength.level} Password
              </span>
              {strength.feedback.length > 0 && (
                <span className="text-xs text-error-500 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  {strength.feedback[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary-500" />
              Customize
            </h3>

            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => updateConfig({ type: 'random' })}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  config.type === 'random'
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Lock className="h-4 w-4" />
                Random
              </button>
              <button
                onClick={() => updateConfig({ type: 'memorable' })}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  config.type === 'memorable'
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Brain className="h-4 w-4" />
                Memorable
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {config.type === 'random' ? (
              // RANDOM PASSWORD CONFIG
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Length</label>
                    <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{config.length} characters</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="50"
                    value={config.length}
                    onChange={(e) => updateConfig({ length: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                    <span>Short (6)</span>
                    <span>Long (50)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'includeUppercase', label: 'ABC', sub: 'Uppercase', state: config.includeUppercase },
                    { id: 'includeLowercase', label: 'abc', sub: 'Lowercase', state: config.includeLowercase },
                    { id: 'includeNumbers', label: '123', sub: 'Numbers', state: config.includeNumbers },
                    { id: 'includeSymbols', label: '#$&', sub: 'Symbols', state: config.includeSymbols },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center h-24",
                        option.state
                          ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-500"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={option.state}
                        onChange={(e) => updateConfig({ [option.id]: e.target.checked })}
                        className="absolute top-3 right-3 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 transition-colors"
                      />
                      <span className="text-xl font-bold mb-1">{option.label}</span>
                      <span className="text-xs font-medium opacity-80">{option.sub}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3 py-4 cursor-pointer group">
                    <div className={cn(
                      "w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out",
                      config.excludeAmbiguous ? "bg-primary-500" : "bg-gray-300"
                    )}>
                      <div className={cn(
                        "bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out",
                        config.excludeAmbiguous ? "translate-x-4" : ""
                      )}></div>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={config.excludeAmbiguous}
                      onChange={(e) => updateConfig({ excludeAmbiguous: e.target.checked })}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">Exclude Ambiguous Characters</span>
                      <span className="text-xs text-gray-500">No I, l, 1, O, 0</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              // MEMORABLE PASSWORD CONFIG
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Word Count</label>
                    <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{config.wordCount} words</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={config.wordCount}
                    onChange={(e) => updateConfig({ wordCount: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                    <span>Short (3)</span>
                    <span>Long (10)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block">Separator</label>
                    <div className="flex gap-2">
                      {['-', '_', '.', 'Space'].map((sep) => {
                        const val = sep === 'Space' ? ' ' : sep;
                        return (
                          <button
                            key={sep}
                            onClick={() => updateConfig({ separator: val })}
                            className={cn(
                              "flex-1 h-10 rounded-lg border-2 font-mono text-lg flex items-center justify-center transition-all",
                              config.separator === val
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-gray-200 hover:border-gray-300 text-gray-500"
                            )}
                          >
                            {sep === 'Space' ? '␣' : sep}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block">Style</label>
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer h-10",
                        config.capitalize
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-500"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={config.capitalize}
                        onChange={(e) => updateConfig({ capitalize: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="font-medium text-sm">Capitalize Words</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* History Sidebar - Vertical List */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px] md:h-auto md:min-h-[600px] sticky top-8">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent
            </h3>
            <span className="text-xs font-mono text-gray-400">{history.length}/10</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                <Shield className="h-12 w-12 mb-4 opacity-10" />
                <p className="text-sm font-medium">No history yet</p>
                <p className="text-xs opacity-70 mt-1">Generated passwords will live here</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-mono text-xs text-gray-600 break-all line-clamp-2 font-medium bg-gray-50 px-2 py-1 rounded w-full mr-2">
                        {item.password}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              i <= calculateStrength(item.password).score
                                ? getStrengthColor(calculateStrength(item.password).level)
                                : "bg-gray-100"
                            )}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.password);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
