import { Metadata } from 'next';
import SplitBillClient from './client';

export const metadata: Metadata = {
    title: 'Advanced Split Bill Calculator | Xenkio',
    description: 'Split bills unfairly but accurately. Calculate individual shares including tax, service charge, and discounts. Export to PDF and generate payment QR codes. 100% Client-Side Private Processing.',
};

export default function SplitBillPage() {
    return (
        <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto mb-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    100% Client-Side Private Processing
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    Advanced Split Bill
                </h1>

                <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
                    Not just a simple divider. Assign items to specific people, calculate proportional tax and service charges, export receipts to PDF, and generate payment QR codes instantly.
                </p>
            </div>

            <SplitBillClient />
        </main>
    );
}
