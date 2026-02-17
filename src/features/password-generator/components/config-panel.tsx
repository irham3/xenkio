'use client';

import { Settings2, Lock, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PasswordConfig } from '../types';

interface ConfigPanelProps {
    config: PasswordConfig;
    updateConfig: (updates: Partial<PasswordConfig>) => void;
}

export function ConfigPanel({ config, updateConfig }: ConfigPanelProps) {
    return (
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
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 cursor-pointer",
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
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 cursor-pointer",
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
                                        onChange={(e) => updateConfig({ [option.id]: (e.target as HTMLInputElement).checked })}
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
                                                    "flex-1 h-10 rounded-lg border-2 font-mono text-lg flex items-center justify-center transition-all cursor-pointer",
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
    );
}
