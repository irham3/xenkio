'use client';

import { useSplitBill } from '../hooks/use-split-bill';
import { PeopleManager } from './people-manager';
import { ItemManager } from './item-manager';
import { BillSummary } from './bill-summary';
import { PaymentQr } from './payment-qr';
import { PdfReceipt } from './pdf-receipt';
import { POPULAR_CURRENCIES } from '../constants';
import { Person } from '../types';
import { Settings2, Percent } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState, useRef } from 'react';

export function SplitBillCalculator() {
    const {
        state,
        summary,
        addPerson,
        removePerson,
        addItem,
        updateItem,
        removeItem,
        toggleItemPerson,
        toggleAllPeopleForItem,
        updateGlobalSettings
    } = useSplitBill();

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const [qrState, setQrState] = useState<{
        isOpen: boolean;
        person: Person | null;
        amount: number;
    }>({ isOpen: false, person: null, amount: 0 });

    const handleExportPdf = async () => {
        if (!printRef.current || isGeneratingPdf) return;

        try {
            setIsGeneratingPdf(true);
            const html2pdf = (await import('html2pdf.js')).default;

            const element = printRef.current;
            const opt: Record<string, unknown> = {
                margin: 0,
                filename: `split-bill-receipt-${new Date().getTime()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleShowQr = (personId: string) => {
        const personSummary = summary.peopleSummaries.find(p => p.person.id === personId);
        if (personSummary) {
            setQrState({
                isOpen: true,
                person: personSummary.person,
                amount: personSummary.total
            });
        }
    };

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start w-full max-w-[1400px] mx-auto min-h-[calc(100vh-140px)]">
                {/* Left Column: Input (People & Items & Settings) */}
                <div className="xl:col-span-8 space-y-6">

                    {/* Unified Top Banner / Settings */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                            <Settings2 className="w-5 h-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-800">Global Settings</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Currency</label>
                                <select
                                    className="w-full h-10 px-3 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
                                    value={state.currency.code}
                                    onChange={(e) => {
                                        const curr = POPULAR_CURRENCIES.find(c => c.code === e.target.value);
                                        if (curr) updateGlobalSettings({ currency: curr });
                                    }}
                                >
                                    {POPULAR_CURRENCIES.map(curr => (
                                        <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol}) - {curr.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tax %</label>
                                <div className="absolute right-3 top-[26px] text-gray-400">
                                    <Percent className="w-4 h-4" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={state.taxPercentage}
                                    onChange={(e) => updateGlobalSettings({ taxPercentage: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 px-3 pr-8 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>

                            <div className="relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Service Charge %</label>
                                <div className="absolute right-3 top-[26px] text-gray-400">
                                    <Percent className="w-4 h-4" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={state.serviceChargePercentage}
                                    onChange={(e) => updateGlobalSettings({ serviceChargePercentage: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-10 px-3 pr-8 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>

                            <div className="relative">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Global Discount</label>
                                <div className="absolute left-3 top-[26px] text-gray-400 text-sm font-medium">
                                    {state.currency.symbol}
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={state.discountAmount}
                                    onChange={(e) => updateGlobalSettings({ discountAmount: parseInt(e.target.value) || 0 })}
                                    className="w-full h-10 pl-8 pr-3 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <PeopleManager
                        people={state.people}
                        onAddPerson={addPerson}
                        onRemovePerson={removePerson}
                    />

                    <ItemManager
                        people={state.people}
                        items={state.items}
                        currency={state.currency}
                        onAddItem={addItem}
                        onUpdateItem={updateItem}
                        onRemoveItem={removeItem}
                        onTogglePerson={toggleItemPerson}
                        onToggleAllPeople={toggleAllPeopleForItem}
                    />
                </div>

                {/* Right Column: Output (Summary & Breakdowns) */}
                <div className="xl:col-span-4 sticky top-6 h-[calc(100vh-48px)]">
                    <BillSummary
                        summary={summary}
                        currency={state.currency}
                        onExportPdf={handleExportPdf}
                        onShowQr={handleShowQr}
                    />
                </div>
            </div>

            {/* Hidden Components for Exports */}
            <PdfReceipt
                summary={summary}
                currency={state.currency}
                printRef={printRef}
            />

            <PaymentQr
                isOpen={qrState.isOpen}
                onClose={() => setQrState(prev => ({ ...prev, isOpen: false }))}
                person={qrState.person}
                amount={qrState.amount}
                currency={state.currency}
            />
        </TooltipProvider>
    );
}
