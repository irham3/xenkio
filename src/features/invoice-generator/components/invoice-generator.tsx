'use client';

import { useInvoiceGenerator } from '../hooks/use-invoice-generator';
import { InvoiceForm } from './invoice-form';
import { InvoicePreview } from './invoice-preview';
import { generateInvoicePDF } from '../lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Eye, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function InvoiceGenerator() {
    const {
        invoiceData,
        totals,
        activeColors,
        setInvoiceNumber,
        setIssueDate,
        setDueDate,
        updateCompany,
        updateClient,
        setLogo,
        addItem,
        removeItem,
        updateItem,
        setNotes,
        updateSettings,
        updateCustomColors,
        resetInvoice,
    } = useInvoiceGenerator();

    const [isGenerating, setIsGenerating] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            await generateInvoicePDF(invoiceData, totals, activeColors);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full">
            {/* Action Bar - Sticky */}
            <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 py-4 mb-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Create Your Invoice</h2>
                        <p className="text-sm text-gray-500">Fill in the details and download as PDF</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Mobile Preview Toggle */}
                        <button
                            onClick={() => setShowMobilePreview(!showMobilePreview)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                            <ChevronDown className={cn("w-4 h-4 transition-transform", showMobilePreview && "rotate-180")} />
                        </button>
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </Button>
                        <Button
                            onClick={resetInvoice}
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Preview - Collapsible */}
            {showMobilePreview && (
                <div className="lg:hidden mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Live Preview</h3>
                    <div className="overflow-auto max-h-[60vh]">
                        <InvoicePreview
                            invoiceData={invoiceData}
                            totals={totals}
                            activeColors={activeColors}
                        />
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Form Section - 3 columns */}
                <div className="lg:col-span-3 space-y-6">
                    <InvoiceForm
                        invoiceData={invoiceData}
                        setInvoiceNumber={setInvoiceNumber}
                        setIssueDate={setIssueDate}
                        setDueDate={setDueDate}
                        updateCompany={updateCompany}
                        updateClient={updateClient}
                        setLogo={setLogo}
                        addItem={addItem}
                        removeItem={removeItem}
                        updateItem={updateItem}
                        setNotes={setNotes}
                        updateSettings={updateSettings}
                        updateCustomColors={updateCustomColors}
                    />
                </div>

                {/* Preview Section - 2 columns - Desktop only */}
                <div className="hidden lg:block lg:col-span-2">
                    <div className="sticky top-40">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Live Preview</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Real-time invoice preview</p>
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full animate-pulse"
                                        style={{ backgroundColor: activeColors.primary }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-100/50 overflow-auto max-h-[calc(100vh-220px)]">
                                <div className="transform scale-[0.85] origin-top">
                                    <InvoicePreview
                                        invoiceData={invoiceData}
                                        totals={totals}
                                        activeColors={activeColors}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-12 p-6 bg-linear-to-r from-primary-50 to-blue-50 rounded-2xl border border-primary-100">
                <h3 className="font-semibold text-primary-900 mb-3">💡 Pro Tips</h3>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-primary-800">
                    <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>Upload your company logo for a professional look</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>Use custom colors to match your brand identity</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>Add bank details for easy client payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>PDF text is selectable and searchable</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
