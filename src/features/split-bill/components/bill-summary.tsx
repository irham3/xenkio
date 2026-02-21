import { BillSummary as BillSummaryType, Currency } from '../types';
import { Download, Receipt, Users, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BillSummaryProps {
    summary: BillSummaryType;
    currency: Currency;
    onExportPdf: () => void;
    onShowQr: (personId: string) => void;
}

export function BillSummary({ summary, currency, onExportPdf, onShowQr }: BillSummaryProps) {
    if (summary.peopleSummaries.length === 0 && summary.subtotal === 0) {
        return null;
    }

    const formatMoney = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary-600" />
                        Final Breakdown
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Subtotal: <span className="font-semibold text-gray-700">{formatMoney(summary.subtotal)}</span>
                        {summary.discountTotal > 0 && ` • Discount: -${formatMoney(summary.discountTotal)}`}
                    </p>
                </div>

                <Button
                    onClick={onExportPdf}
                    disabled={summary.grandTotal === 0}
                    variant="outline"
                    className="h-9 border-primary-200 hover:bg-primary-50 hover:text-primary-700 font-semibold"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-5">
                <div className="space-y-4">
                    {summary.peopleSummaries.map((ps) => (
                        <div key={ps.person.id} className="bg-white border text-left border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gray-100 group-hover:bg-primary-400 transition-colors" />

                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">{ps.person.name}</h4>
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                        Pays for {ps.items.length} item(s)
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-primary-600 tracking-tight">
                                        {formatMoney(ps.total)}
                                    </div>
                                    <button
                                        onClick={() => onShowQr(ps.person.id)}
                                        disabled={ps.total <= 0}
                                        className="text-[10px] font-bold text-gray-500 hover:text-primary-600 uppercase tracking-widest mt-1 disabled:opacity-50"
                                    >
                                        Share QR →
                                    </button>
                                </div>
                            </div>

                            {ps.items.length > 0 && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="space-y-2">
                                        {ps.items.map((pi, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1.5 truncate pr-2 w-2/3">
                                                    <span className="text-gray-400 font-medium">1/{pi.item.splitAmong.length}</span>
                                                    <span className="font-semibold text-gray-700 truncate">{pi.item.name}</span>
                                                </div>
                                                <span className="font-mono text-gray-600">
                                                    {formatMoney(pi.shareAmount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {(ps.taxShare > 0 || ps.serviceChargeShare > 0 || ps.discountShare > 0) && (
                                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-1.5">
                                            {ps.discountShare > 0 && (
                                                <div className="flex justify-between text-[11px] font-medium text-amber-600">
                                                    <span>Share of Discount</span>
                                                    <span>-{formatMoney(ps.discountShare)}</span>
                                                </div>
                                            )}
                                            {ps.serviceChargeShare > 0 && (
                                                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                                                    <span>Share of Service (SVC)</span>
                                                    <span>+{formatMoney(ps.serviceChargeShare)}</span>
                                                </div>
                                            )}
                                            {ps.taxShare > 0 && (
                                                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                                                    <span>Share of Tax</span>
                                                    <span>+{formatMoney(ps.taxShare)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {summary.peopleSummaries.length === 0 && (
                        <div className="text-center py-10 px-4">
                            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">Add people and items to see breakdown</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Bill Footer */}
            {summary.grandTotal > 0 && (
                <div className="bg-gray-900 text-white p-5">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">Grand Total</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black">{formatMoney(summary.grandTotal)}</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="text-gray-500 hover:text-gray-300">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs max-w-xs">
                                            Includes Tax ({formatMoney(summary.taxTotal)}), SVC ({formatMoney(summary.serviceChargeTotal)}), minus Diskon ({formatMoney(summary.discountTotal)})
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-medium">Total Items</p>
                            <p className="text-sm font-bold text-gray-300">{summary.peopleSummaries.reduce((a, b) => a + b.items.length, 0)} Pcs</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
