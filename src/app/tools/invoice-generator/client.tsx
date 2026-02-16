'use client';

import dynamic from 'next/dynamic';

const InvoiceGenerator = dynamic(
    () => import('@/features/invoice-generator/components/invoice-generator').then(mod => ({ default: mod.InvoiceGenerator })),
    { ssr: false }
);

export function InvoiceGeneratorClient() {
    return (
        <div className="w-full">
            <InvoiceGenerator />
        </div>
    );
}
