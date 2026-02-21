import { useState } from 'react';
import { POPULAR_CURRENCIES } from '../constants';
import { Percent, Users, Receipt } from 'lucide-react';

export function SimpleSplitCalculator() {
    const [currencyCode, setCurrencyCode] = useState('IDR');
    const [subtotal, setSubtotal] = useState<number | ''>('');
    const [numPeople, setNumPeople] = useState<number | ''>(2);
    const [taxPercentage, setTaxPercentage] = useState<number | ''>('');
    const [serviceChargePercentage, setServiceChargePercentage] = useState<number | ''>('');
    const [discountAmount, setDiscountAmount] = useState<number | ''>('');

    const currency = POPULAR_CURRENCIES.find(c => c.code === currencyCode) || POPULAR_CURRENCIES[0];

    const safeSubtotal = Number(subtotal) || 0;
    const safeTax = Number(taxPercentage) || 0;
    const safeService = Number(serviceChargePercentage) || 0;
    const safeDiscount = Number(discountAmount) || 0;
    const safePeople = Number(numPeople) || 1;

    const discountRatio = safeSubtotal > 0 ? Math.min(safeDiscount / safeSubtotal, 1) : 0;
    const amountAfterDiscount = safeSubtotal * (1 - discountRatio);

    const serviceAmount = amountAfterDiscount * (safeService / 100);
    const amountAfterService = amountAfterDiscount + serviceAmount;

    const taxAmount = amountAfterService * (safeTax / 100);
    const grandTotal = amountAfterService + taxAmount;

    const perPerson = grandTotal / Math.max(1, safePeople);

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800">Bill Details</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Currency</label>
                        <select
                            value={currencyCode}
                            onChange={(e) => setCurrencyCode(e.target.value)}
                            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
                        >
                            {POPULAR_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Total Bill / Subtotal</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{currency.symbol}</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={subtotal}
                                onChange={(e) => setSubtotal(e.target.value ? Number(e.target.value) : '')}
                                className="w-full h-12 pl-12 pr-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Number of People</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Users className="w-5 h-5" /></span>
                            <input
                                type="number"
                                min="1"
                                placeholder="2"
                                value={numPeople}
                                onChange={(e) => setNumPeople(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full h-12 pl-12 pr-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tax %</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Percent className="w-4 h-4" /></span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="0"
                                    value={taxPercentage}
                                    onChange={(e) => setTaxPercentage(e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full h-11 px-4 pr-10 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Service Charge %</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Percent className="w-4 h-4" /></span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="0"
                                    value={serviceChargePercentage}
                                    onChange={(e) => setServiceChargePercentage(e.target.value ? parseFloat(e.target.value) : '')}
                                    className="w-full h-11 px-4 pr-10 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Discount Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{currency.symbol}</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : '')}
                                className="w-full h-11 pl-12 pr-4 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm sticky top-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                    <span className="w-2 h-6 bg-primary-600 rounded-full" />
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Summary Breakdown</h3>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="text-gray-900 font-semibold">{currency.symbol}{safeSubtotal.toLocaleString()}</span>
                    </div>
                    {safeDiscount > 0 && (
                        <div className="flex justify-between items-center text-amber-600 font-medium bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-100/50">
                            <span>Discount Applied</span>
                            <span>-{currency.symbol}{safeDiscount.toLocaleString()}</span>
                        </div>
                    )}
                    {(safeService > 0 || safeTax > 0) && (
                        <div className="space-y-3 pt-2">
                            {safeService > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Service Charge ({safeService}%)</span>
                                    <span className="text-gray-700 font-medium">+{currency.symbol}{serviceAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                            {safeTax > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Tax ({safeTax}%)</span>
                                    <span className="text-gray-700 font-medium">+{currency.symbol}{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Grand Total</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">
                            {currency.symbol}{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>

                <div className="bg-primary-50/50 rounded-2xl p-8 border border-primary-100/50 text-center relative overflow-hidden group">

                    <div className="relative z-10">
                        <div className="inline-block px-3 py-1 bg-white rounded-full text-[10px] font-bold text-primary-600 uppercase tracking-widest border border-primary-100 mb-4">
                            Each person pays ({safePeople} {safePeople === 1 ? 'person' : 'people'})
                        </div>
                        <div className="text-5xl font-black text-primary-600 tracking-tighter truncate px-2">
                            {currency.symbol}{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-primary-400 mt-2 font-medium">Split evenly among all participants</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
