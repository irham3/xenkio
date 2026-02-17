'use client';

import { useJwtDebugger } from '@/features/jwt-debugger/hooks/use-jwt-debugger';
import { TokenInputPanel } from '@/features/jwt-debugger/components/token-input-panel';
import { DecodedOutputPanel } from '@/features/jwt-debugger/components/decoded-output-panel';
import { FileSearch, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { DEFAULT_TOKEN } from '@/features/jwt-debugger/types';

export function JwtDebuggerClient() {
    const { options, result, updateOption, trigger } = useJwtDebugger();

    const handleModeChange = (mode: 'encode' | 'decode') => {
        if (mode === 'decode' && !options.token) {
            updateOption('token', result.encodedToken || DEFAULT_TOKEN);
        }
        updateOption('mode', mode);
    };

    return (
        <div className="w-full">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
                <button
                    onClick={() => handleModeChange('encode')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer",
                        options.mode === 'encode'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <Code2 className="w-4 h-4" />
                    Sign & Encode
                </button>
                <button
                    onClick={() => handleModeChange('decode')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer",
                        options.mode === 'decode'
                            ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <FileSearch className="w-4 h-4" />
                    Verify & Decode
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">
                    <TokenInputPanel
                        options={options}
                        updateOption={updateOption}
                        onTrigger={trigger}
                    />
                    <DecodedOutputPanel
                        mode={options.mode}
                        result={result}
                        hasToken={options.mode === 'decode' ? !!options.token : !!options.payload}
                    />
                </div>
            </div>
        </div>
    );
}
