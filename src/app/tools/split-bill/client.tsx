'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SimpleSplitCalculator } from '@/features/split-bill/components/simple-split-calculator';

const SplitBillCalculator = dynamic(
    () => import('@/features/split-bill/components/split-bill-calculator').then(mod => mod.SplitBillCalculator),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-[1400px] mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                <div className="relative flex items-center justify-center w-16 h-16 mb-6">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary-100 opacity-50 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-600"></span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Calculator...</h3>
                <p className="text-sm text-gray-500 font-medium">Preparing advanced split bill engine</p>
            </div>
        )
    }
);

export default function SplitBillClient() {
    const [mode, setMode] = useState<'advanced' | 'simple'>('advanced');

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
            <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
                    <button
                        onClick={() => setMode('advanced')}
                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === 'advanced' ? 'bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] text-primary-600 ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Advanced Split
                    </button>
                    <button
                        onClick={() => setMode('simple')}
                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === 'simple' ? 'bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] text-primary-600 ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Simple Split
                    </button>
                </div>
            </div>

            <div className="transition-all duration-500">
                {mode === 'advanced' ? <SplitBillCalculator /> : <SimpleSplitCalculator />}
            </div>
        </div>
    );
}
