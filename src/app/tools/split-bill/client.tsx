'use client';

import dynamic from 'next/dynamic';

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
    return <SplitBillCalculator />;
}
