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
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    Split Bill
                </h1>

                <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
                    Not just a simple divider. Assign items to specific people, calculate proportional tax and service charges, export receipts to PDF, and generate payment QR codes instantly.
                </p>
            </div>

            <SplitBillClient />
        </main>
    );
}
