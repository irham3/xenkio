'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClearButton } from '@/components/shared';
import { JwtOptions, JWT_ALGORITHMS } from '../types';
import { ChevronDown, Lock, RefreshCcw } from 'lucide-react';

interface TokenInputPanelProps {
    options: JwtOptions;
    updateOption: <K extends keyof JwtOptions>(key: K, value: JwtOptions[K]) => void;
    onReset: () => void;
    onTrigger: () => void;
}

export function TokenInputPanel({ options, updateOption, onTrigger }: TokenInputPanelProps) {
    const isDecode = options.mode === 'decode';

    const handleClear = () => {
        if (isDecode) {
            updateOption('token', '');
        } else {
            updateOption('payload', '{\n  \n}');
        }
    };

    const handleReSign = () => {
        try {
            // Force update iat to show change
            const currentPayload = JSON.parse(options.payload);
            const newPayload = {
                ...currentPayload,
                iat: Math.floor(Date.now() / 1000)
            };
            updateOption('payload', JSON.stringify(newPayload, null, 2));
            // Trigger will happen via useEffect when payload changes, but we call it explicitly just in case custom logic changes later
            setTimeout(onTrigger, 0);
        } catch {
            // If payload is invalid JSON, just trigger verify
            onTrigger();
        }
    };

    return (
        <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-900 uppercase tracking-tight">
                        {isDecode ? 'Encoded Token' : 'Payload (JSON)'}
                    </Label>
                    <div className="flex gap-2">
                        <ClearButton onClick={handleClear} size="sm" variant="ghost" className="h-6 px-2 text-xs" />
                    </div>
                </div>

                <textarea
                    value={isDecode ? options.token : options.payload}
                    onChange={(e) => updateOption(isDecode ? 'token' : 'payload', e.target.value)}
                    placeholder={isDecode ? 'Paste your JWT token here...' : 'Enter your payload JSON...'}
                    className="w-full min-h-[300px] p-4 text-[13px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                    spellCheck={false}
                />
            </div>

            {!isDecode && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Algorithm</Label>
                            <div className="relative">
                                <select
                                    value={options.algorithm}
                                    onChange={(e) => updateOption('algorithm', e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 block p-3 pr-10 outline-none transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    {JWT_ALGORITHMS.map((alg) => (
                                        <option key={alg.id} value={alg.id}>{alg.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900 uppercase tracking-tight">
                    Secret / Private Key
                </Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={options.secret}
                        onChange={(e) => updateOption('secret', e.target.value)}
                        placeholder="your-256-bit-secret"
                        className="w-full p-3 pl-10 text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
                <p className="text-[11px] text-gray-400 italic font-medium">
                    {isDecode ? 'Used to verify the token signature' : 'Used to sign the generated token'}
                </p>
            </div>

            {!isDecode && (
                <div className="pt-2">
                    <Button
                        onClick={handleReSign}
                        className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm transition-all"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Re-Sign Token
                    </Button>
                </div>
            )}
        </div>
    );
}
