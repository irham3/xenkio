import { BillSummary as BillSummaryType, Currency } from '../types';
import { format } from 'date-fns';

interface PdfReceiptProps {
    summary: BillSummaryType;
    currency: Currency;
    printRef: React.RefObject<HTMLDivElement | null>;
}

export function PdfReceipt({ summary, currency, printRef }: PdfReceiptProps) {
    const formatMoney = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none w-[800px]">
            {/* This div is strictly used as the template for html2pdf. It needs fixed dimensions and full styling to render correctly to canvas. */}
            <div ref={printRef} className="bg-white text-gray-900 p-12 min-h-[1130px] w-[800px] font-sans box-border">

                {/* Header Section */}
                <div className="text-center mb-10 pb-8 border-b-2 border-dashed border-gray-200">
                    <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">Split Bill Receipt</h1>
                    <p className="text-gray-500 text-sm font-medium">Generated via Xenkio.com • {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
                </div>

                {/* Main Content Area */}
                <div className="space-y-8">

                    {/* Items Breakdown list if needed */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-gray-200 pb-2 text-gray-800 uppercase tracking-widest">Individual Shares</h2>

                        <div className="grid grid-cols-2 gap-6">
                            {summary.peopleSummaries.map(ps => (
                                <div key={ps.person.id} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg">{ps.person.name}</h3>
                                        <span className="text-xl font-black text-primary-600">{formatMoney(ps.total)}</span>
                                    </div>

                                    {ps.items.length > 0 && (
                                        <ul className="space-y-2 mb-4">
                                            {ps.items.map((pi, idx) => (
                                                <li key={idx} className="flex justify-between text-xs text-gray-600 border-b border-gray-50 pb-1">
                                                    <span className="truncate pr-2">({pi.item.quantity}x) {pi.item.name} <span className="text-gray-400 font-medium">÷{pi.item.splitAmong.length}</span></span>
                                                    <span className="font-mono">{formatMoney(pi.shareAmount)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="space-y-1 text-[10px] text-gray-500 font-medium border-t border-gray-200/50 pt-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatMoney(ps.subtotal)}</span>
                                        </div>
                                        {ps.discountShare > 0 && (
                                            <div className="flex justify-between text-gray-700">
                                                <span>Discount</span>
                                                <span>-{formatMoney(ps.discountShare)}</span>
                                            </div>
                                        )}
                                        {ps.serviceChargeShare > 0 && (
                                            <div className="flex justify-between">
                                                <span>SVC Share</span>
                                                <span>+{formatMoney(ps.serviceChargeShare)}</span>
                                            </div>
                                        )}
                                        {ps.taxShare > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tax Share</span>
                                                <span>+{formatMoney(ps.taxShare)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grand Summary Section */}
                    <div className="mt-12 bg-gray-900 text-white p-8 rounded-2xl flex justify-between items-center break-inside-avoid">
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-4xl font-black">{formatMoney(summary.grandTotal)}</p>
                        </div>
                        <div className="text-right text-xs font-medium space-y-1.5 text-gray-300">
                            <div className="flex gap-4 justify-between">
                                <span>Subtotal</span>
                                <span className="font-mono text-white">{formatMoney(summary.subtotal)}</span>
                            </div>
                            <div className="flex gap-4 justify-between text-gray-400">
                                <span>Discount</span>
                                <span className="font-mono">-{formatMoney(summary.discountTotal)}</span>
                            </div>
                            <div className="flex gap-4 justify-between text-gray-400">
                                <span>SVC Total</span>
                                <span className="font-mono">+{formatMoney(summary.serviceChargeTotal)}</span>
                            </div>
                            <div className="flex gap-4 justify-between text-gray-400">
                                <span>Tax Total</span>
                                <span className="font-mono">+{formatMoney(summary.taxTotal)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
