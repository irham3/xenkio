'use client';

import Image from 'next/image';
import { InvoiceData, InvoiceTotals, InvoiceColors } from '../types';
import { formatCurrency, calculateItemTotal } from '../lib/invoice-utils';

interface InvoicePreviewProps {
    invoiceData: InvoiceData;
    totals: InvoiceTotals;
    activeColors: InvoiceColors;
}

// ─── Shared helpers ───────────────────────────────────────────────
function Logo({ src, size = 48, className = '' }: { src?: string; size?: number; className?: string }) {
    if (!src) return null;
    return (
        <Image
            src={src}
            alt="Logo"
            width={size * 2.5}
            height={size}
            className={`object-contain ${className}`}
            style={{ height: size, width: 'auto' }}
            unoptimized
        />
    );
}

function fmtDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtDateShort(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Main component ──────────────────────────────────────────────
export function InvoicePreview({ invoiceData, totals, activeColors }: InvoicePreviewProps) {
    const { company, client, items, settings, invoiceNumber, issueDate, dueDate, notes } = invoiceData;
    const { currencySymbol, template } = settings;
    const c = activeColors;

    switch (template) {
        case 'modern-blue':
            return <ModernBlue {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'executive-dark':
            return <ExecutiveDark {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'minimal-clean':
            return <MinimalClean {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'corporate-green':
            return <CorporateGreen {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'creative-purple':
            return <CreativePurple {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'elegant-gold':
            return <ElegantGold {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'tech-gradient':
            return <TechGradient {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        case 'classic-formal':
            return <ClassicFormal {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
        default:
            return <ModernBlue {...{ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }} />;
    }
}

// ─── Shared types ─────────────────────────────────────────────────
type TemplateProps = {
    company: InvoiceData['company'];
    client: InvoiceData['client'];
    items: InvoiceData['items'];
    settings: InvoiceData['settings'];
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    totals: InvoiceTotals;
    c: InvoiceColors;
    currencySymbol: string;
};

// ═══════════════════════════════════════════════════════════════════
// 1. MODERN BLUE | Left accent bar, side-by-side header, rounded table
// ═══════════════════════════════════════════════════════════════════
function ModernBlue({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-gray-100 rounded-lg overflow-hidden flex" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Left accent bar */}
            <div className="w-2 shrink-0" style={{ backgroundColor: c.primary }} />
            <div className="flex-1 p-6">
                {/* Header: Logo + Invoice title left, Company info right */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                        <Logo src={company.logo} size={44} className="rounded" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: c.primary }}>INVOICE</h1>
                            <p className="text-xs mt-0.5 opacity-50">{invoiceNumber || 'INV-00000'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base">{company.name || 'Your Company'}</p>
                        {company.address && <p className="text-xs opacity-60">{company.address}</p>}
                        {company.email && <p className="text-xs opacity-60">{company.email}</p>}
                        {company.phone && <p className="text-xs opacity-60">{company.phone}</p>}
                    </div>
                </div>

                {/* Bill To + Dates side by side */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: c.primary }}>Bill To</h3>
                        <p className="font-semibold">{client.name || 'Client Name'}</p>
                        {client.address && <p className="text-xs opacity-60">{client.address}</p>}
                        {client.email && <p className="text-xs opacity-60">{client.email}</p>}
                        {client.phone && <p className="text-xs opacity-60">{client.phone}</p>}
                    </div>
                    <div className="text-right space-y-1">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">Issue Date</span>
                            <span className="text-xs font-medium">{fmtDate(issueDate)}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">Due Date</span>
                            <span className="text-xs font-medium">{fmtDate(dueDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Items table - rounded with colored header */}
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: c.primary }}>
                                <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white">Description</th>
                                <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white w-14">Qty</th>
                                <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white w-20">Price</th>
                                <th className="text-right py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ backgroundColor: i % 2 === 1 ? '#f9fafb' : 'transparent', borderBottom: '1px solid #e5e7eb' }}>
                                    <td className="py-2.5 px-3 text-xs">{item.description || 'Item description'}</td>
                                    <td className="py-2.5 px-2 text-xs text-center opacity-70">{item.quantity}</td>
                                    <td className="py-2.5 px-2 text-xs text-right opacity-70">{formatCurrency(item.unitPrice, currencySymbol)}</td>
                                    <td className="py-2.5 px-3 text-xs text-right font-medium">{formatCurrency(calculateItemTotal(item), currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals - right aligned */}
                <TotalsSidebar {...{ totals, settings, currencySymbol, c }} />
                <BottomSection {...{ settings, notes, c, company, isDark: false }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 2. EXECUTIVE DARK | Full dark bg, large centered title, card-style items
// ═══════════════════════════════════════════════════════════════════
function ExecutiveDark({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-zinc-700 rounded-lg overflow-hidden" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Top banner */}
            <div className="p-6 text-center" style={{ backgroundColor: c.primary }}>
                <Logo src={company.logo} size={40} className="mx-auto mb-2 rounded" />
                <h1 className="text-3xl font-extrabold tracking-widest text-white">INVOICE</h1>
                <p className="text-white/60 text-xs mt-1 font-mono">{invoiceNumber || 'INV-00000'}</p>
            </div>

            <div className="p-6">
                {/* Company + Client in two columns with cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: c.secondary }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: c.accent }}>From</h3>
                        <p className="font-bold text-sm">{company.name || 'Your Company'}</p>
                        {company.address && <p className="text-xs opacity-60 mt-0.5">{company.address}</p>}
                        {company.email && <p className="text-xs opacity-60">{company.email}</p>}
                        {company.phone && <p className="text-xs opacity-60">{company.phone}</p>}
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: c.secondary }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: c.accent }}>Bill To</h3>
                        <p className="font-bold text-sm">{client.name || 'Client Name'}</p>
                        {client.address && <p className="text-xs opacity-60 mt-0.5">{client.address}</p>}
                        {client.email && <p className="text-xs opacity-60">{client.email}</p>}
                        {client.phone && <p className="text-xs opacity-60">{client.phone}</p>}
                    </div>
                </div>

                {/* Dates row */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 p-2.5 rounded-md text-center" style={{ backgroundColor: c.secondary }}>
                        <p className="text-[10px] uppercase tracking-wider opacity-50">Issue Date</p>
                        <p className="text-xs font-semibold mt-0.5">{fmtDateShort(issueDate)}</p>
                    </div>
                    <div className="flex-1 p-2.5 rounded-md text-center" style={{ backgroundColor: c.secondary }}>
                        <p className="text-[10px] uppercase tracking-wider opacity-50">Due Date</p>
                        <p className="text-xs font-semibold mt-0.5">{fmtDateShort(dueDate)}</p>
                    </div>
                    <div className="flex-1 p-2.5 rounded-md text-center" style={{ backgroundColor: c.accent, color: '#fff' }}>
                        <p className="text-[10px] uppercase tracking-wider opacity-80">Total Due</p>
                        <p className="text-xs font-bold mt-0.5">{formatCurrency(totals.total, currencySymbol)}</p>
                    </div>
                </div>

                {/* Items as card rows */}
                <div className="space-y-2 mb-6">
                    <div className="grid grid-cols-12 gap-2 px-2 py-1">
                        <span className="col-span-6 text-[10px] font-bold uppercase tracking-wider opacity-40">Description</span>
                        <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider opacity-40 text-center">Qty</span>
                        <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider opacity-40 text-right">Price</span>
                        <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider opacity-40 text-right">Amount</span>
                    </div>
                    {items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 rounded-lg" style={{ backgroundColor: c.secondary }}>
                            <span className="col-span-6 text-xs font-medium">{item.description || 'Item description'}</span>
                            <span className="col-span-2 text-xs text-center opacity-70">{item.quantity}</span>
                            <span className="col-span-2 text-xs text-right opacity-70">{formatCurrency(item.unitPrice, currencySymbol)}</span>
                            <span className="col-span-2 text-xs text-right font-semibold" style={{ color: c.accent }}>{formatCurrency(calculateItemTotal(item), currencySymbol)}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <TotalsSidebar {...{ totals, settings, currencySymbol, c }} />
                <BottomSection {...{ settings, notes, c, company, isDark: true }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 3. MINIMAL CLEAN | Ultra-sparse, no backgrounds, fine lines only
// ═══════════════════════════════════════════════════════════════════
function MinimalClean({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-gray-100 rounded-lg overflow-hidden p-8" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Header - invoice number top right, logo + company bottom left */}
            <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-3">
                    <Logo src={company.logo} size={36} className="rounded" />
                    <div>
                        <p className="font-bold text-sm">{company.name || 'Your Company'}</p>
                        {company.email && <p className="text-[11px] opacity-40">{company.email}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-extralight tracking-tight" style={{ color: c.primary }}>Invoice</p>
                    <p className="text-[11px] opacity-40 mt-1 font-mono">{invoiceNumber || 'INV-00000'}</p>
                </div>
            </div>

            {/* Two-col: Bill To + Dates */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest opacity-30 mb-2">Billed To</p>
                    <p className="font-semibold">{client.name || 'Client Name'}</p>
                    {client.address && <p className="text-xs opacity-50">{client.address}</p>}
                    {client.email && <p className="text-xs opacity-50">{client.email}</p>}
                </div>
                <div className="space-y-3 text-right">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-30">Date</p>
                        <p className="text-xs">{fmtDateShort(issueDate)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-30">Due</p>
                        <p className="text-xs">{fmtDateShort(dueDate)}</p>
                    </div>
                </div>
            </div>

            {/* Items - borderless, just thin lines */}
            <div className="mb-8">
                <div className="flex py-2 border-b" style={{ borderColor: c.primary }}>
                    <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">Item</span>
                    <span className="w-12 text-[10px] font-semibold uppercase tracking-widest opacity-40 text-center">Qty</span>
                    <span className="w-20 text-[10px] font-semibold uppercase tracking-widest opacity-40 text-right">Rate</span>
                    <span className="w-24 text-[10px] font-semibold uppercase tracking-widest opacity-40 text-right">Amount</span>
                </div>
                {items.map((item) => (
                    <div key={item.id} className="flex py-3 border-b border-gray-100">
                        <span className="flex-1 text-xs">{item.description || 'Item description'}</span>
                        <span className="w-12 text-xs text-center opacity-60">{item.quantity}</span>
                        <span className="w-20 text-xs text-right opacity-60">{formatCurrency(item.unitPrice, currencySymbol)}</span>
                        <span className="w-24 text-xs text-right font-medium">{formatCurrency(calculateItemTotal(item), currencySymbol)}</span>
                    </div>
                ))}
            </div>

            {/* Totals - minimal, right-aligned */}
            <div className="flex justify-end mb-8">
                <div className="w-48 space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="opacity-40">Subtotal</span>
                        <span>{formatCurrency(totals.subtotal, currencySymbol)}</span>
                    </div>
                    {settings.discountEnabled && totals.discount > 0 && (
                        <div className="flex justify-between text-xs text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(totals.discount, currencySymbol)}</span>
                        </div>
                    )}
                    {settings.taxEnabled && totals.tax > 0 && (
                        <div className="flex justify-between text-xs">
                            <span className="opacity-40">Tax</span>
                            <span>{formatCurrency(totals.tax, currencySymbol)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 mt-1 border-t" style={{ borderColor: c.primary }}>
                        <span className="font-bold text-sm" style={{ color: c.primary }}>Total</span>
                        <span className="font-bold text-sm" style={{ color: c.primary }}>{formatCurrency(totals.total, currencySymbol)}</span>
                    </div>
                </div>
            </div>

            <BottomSection {...{ settings, notes, c, company, isDark: false }} />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 4. CORPORATE GREEN | Boxed header with invoice detail card, striped table
// ═══════════════════════════════════════════════════════════════════
function CorporateGreen({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-gray-100 rounded-lg overflow-hidden" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Header with two sides */}
            <div className="flex">
                {/* Company side */}
                <div className="flex-1 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Logo src={company.logo} size={40} className="rounded" />
                        <p className="font-bold text-lg">{company.name || 'Your Company'}</p>
                    </div>
                    {company.address && <p className="text-xs opacity-60">{company.address}</p>}
                    <div className="flex gap-4 mt-1">
                        {company.email && <p className="text-xs opacity-60">{company.email}</p>}
                        {company.phone && <p className="text-xs opacity-60">{company.phone}</p>}
                    </div>
                </div>
                {/* Invoice detail card */}
                <div className="p-5 min-w-[180px] text-white text-right" style={{ backgroundColor: c.primary }}>
                    <h1 className="text-xl font-bold tracking-wider mb-3">INVOICE</h1>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-3">
                            <span className="opacity-70">Number:</span>
                            <span className="font-semibold">{invoiceNumber || 'INV-00000'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="opacity-70">Date:</span>
                            <span className="font-semibold">{fmtDateShort(issueDate)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="opacity-70">Due:</span>
                            <span className="font-semibold">{fmtDateShort(dueDate)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {/* Bill To */}
                <div className="mb-5 p-3 rounded-md border" style={{ borderColor: `${c.primary}30` }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c.primary }}>Bill To</h3>
                    <p className="font-semibold">{client.name || 'Client Name'}</p>
                    {client.address && <p className="text-xs opacity-60">{client.address}</p>}
                    <div className="flex gap-4">
                        {client.email && <p className="text-xs opacity-60">{client.email}</p>}
                        {client.phone && <p className="text-xs opacity-60">{client.phone}</p>}
                    </div>
                </div>

                {/* Table with alternating rows */}
                <div className="mb-5 rounded-lg overflow-hidden border" style={{ borderColor: `${c.primary}20` }}>
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: `${c.primary}15` }}>
                                <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: c.primary }}>Description</th>
                                <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider w-14" style={{ color: c.primary }}>Qty</th>
                                <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider w-20" style={{ color: c.primary }}>Rate</th>
                                <th className="text-right py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider w-24" style={{ color: c.primary }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ backgroundColor: i % 2 === 1 ? `${c.primary}08` : 'transparent', borderBottom: `1px solid ${c.primary}15` }}>
                                    <td className="py-2.5 px-3 text-xs">{item.description || 'Item description'}</td>
                                    <td className="py-2.5 px-2 text-xs text-center opacity-70">{item.quantity}</td>
                                    <td className="py-2.5 px-2 text-xs text-right opacity-70">{formatCurrency(item.unitPrice, currencySymbol)}</td>
                                    <td className="py-2.5 px-3 text-xs text-right font-semibold">{formatCurrency(calculateItemTotal(item), currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals in box */}
                <div className="flex justify-end mb-5">
                    <div className="w-56 p-3 rounded-md" style={{ backgroundColor: `${c.primary}08`, border: `1px solid ${c.primary}20` }}>
                        <div className="flex justify-between py-1 text-xs"><span className="opacity-60">Subtotal</span><span>{formatCurrency(totals.subtotal, currencySymbol)}</span></div>
                        {settings.discountEnabled && totals.discount > 0 && (
                            <div className="flex justify-between py-1 text-xs text-green-600"><span>Discount ({settings.discountRate}%)</span><span>-{formatCurrency(totals.discount, currencySymbol)}</span></div>
                        )}
                        {settings.taxEnabled && totals.tax > 0 && (
                            <div className="flex justify-between py-1 text-xs"><span className="opacity-60">Tax ({settings.taxRate}%)</span><span>{formatCurrency(totals.tax, currencySymbol)}</span></div>
                        )}
                        <div className="flex justify-between py-2 mt-1 border-t-2 font-bold" style={{ borderColor: c.primary, color: c.primary }}>
                            <span>Total</span><span>{formatCurrency(totals.total, currencySymbol)}</span>
                        </div>
                    </div>
                </div>

                <BottomSection {...{ settings, notes, c, company, isDark: false }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 5. CREATIVE PURPLE | Asymmetric sidebar layout, items as cards
// ═══════════════════════════════════════════════════════════════════
function CreativePurple({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-gray-100 rounded-lg overflow-hidden flex" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Sidebar */}
            <div className="w-[140px] shrink-0 p-4 text-white flex flex-col" style={{ background: `linear-gradient(180deg, ${c.primary}, ${c.accent})` }}>
                <Logo src={company.logo} size={32} className="rounded mb-3 brightness-200 contrast-0" />
                <h1 className="text-lg font-extrabold tracking-wider mb-1">INVOICE</h1>
                <p className="text-white/60 text-[10px] font-mono mb-6">{invoiceNumber || 'INV-00000'}</p>

                <div className="space-y-4 mt-auto text-[10px]">
                    <div>
                        <p className="uppercase tracking-wider text-white/50 mb-0.5">Date</p>
                        <p className="font-medium text-white/90">{fmtDateShort(issueDate)}</p>
                    </div>
                    <div>
                        <p className="uppercase tracking-wider text-white/50 mb-0.5">Due</p>
                        <p className="font-medium text-white/90">{fmtDateShort(dueDate)}</p>
                    </div>
                    <div className="pt-3 border-t border-white/20">
                        <p className="uppercase tracking-wider text-white/50 mb-0.5">Total</p>
                        <p className="font-bold text-base text-white">{formatCurrency(totals.total, currencySymbol)}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
                {/* Company + Client */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1">From</p>
                        <p className="font-bold text-sm">{company.name || 'Your Company'}</p>
                        {company.address && <p className="text-xs opacity-50">{company.address}</p>}
                        {company.email && <p className="text-xs opacity-50">{company.email}</p>}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1">To</p>
                        <p className="font-bold text-sm">{client.name || 'Client Name'}</p>
                        {client.address && <p className="text-xs opacity-50">{client.address}</p>}
                        {client.email && <p className="text-xs opacity-50">{client.email}</p>}
                    </div>
                </div>

                {/* Items as individual cards */}
                <div className="space-y-2 mb-5">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100" style={{ backgroundColor: `${c.primary}05` }}>
                            <div className="flex-1">
                                <p className="text-xs font-medium">{item.description || 'Item description'}</p>
                                <p className="text-[10px] opacity-40 mt-0.5">{item.quantity} × {formatCurrency(item.unitPrice, currencySymbol)}</p>
                            </div>
                            <p className="text-sm font-bold" style={{ color: c.primary }}>{formatCurrency(calculateItemTotal(item), currencySymbol)}</p>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <TotalsSidebar {...{ totals, settings, currencySymbol, c }} />
                <BottomSection {...{ settings, notes, c, company, isDark: false }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 6. ELEGANT GOLD | Centered header, ornamental lines, refined typography
// ═══════════════════════════════════════════════════════════════════
function ElegantGold({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border rounded-lg overflow-hidden" style={{ backgroundColor: c.background, color: c.text, borderColor: `${c.primary}30` }}>
            {/* Top ornamental line */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }} />

            <div className="p-7">
                {/* Centered header */}
                <div className="text-center mb-8">
                    <Logo src={company.logo} size={44} className="mx-auto mb-3 rounded" />
                    <h1 className="text-2xl font-light tracking-[0.3em] uppercase" style={{ color: c.primary }}>Invoice</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="h-px w-12" style={{ backgroundColor: c.primary }} />
                        <p className="text-[10px] font-mono opacity-50">{invoiceNumber || 'INV-00000'}</p>
                        <div className="h-px w-12" style={{ backgroundColor: c.primary }} />
                    </div>
                </div>

                {/* Company + Client + Dates in 3 cols */}
                <div className="grid grid-cols-3 gap-4 mb-8 py-4 border-y" style={{ borderColor: `${c.primary}20` }}>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: c.primary }}>From</p>
                        <p className="font-semibold text-xs">{company.name || 'Your Company'}</p>
                        {company.address && <p className="text-[11px] opacity-50">{company.address}</p>}
                        {company.email && <p className="text-[11px] opacity-50">{company.email}</p>}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: c.primary }}>To</p>
                        <p className="font-semibold text-xs">{client.name || 'Client Name'}</p>
                        {client.address && <p className="text-[11px] opacity-50">{client.address}</p>}
                        {client.email && <p className="text-[11px] opacity-50">{client.email}</p>}
                    </div>
                    <div className="text-right space-y-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest" style={{ color: c.primary }}>Date</p>
                            <p className="text-xs">{fmtDateShort(issueDate)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest" style={{ color: c.primary }}>Due</p>
                            <p className="text-xs">{fmtDateShort(dueDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Table with gold-tinted header */}
                <div className="mb-6">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${c.primary}` }}>
                                <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: c.primary }}>Description</th>
                                <th className="text-center py-2 px-2 text-[10px] font-semibold uppercase tracking-widest w-14" style={{ color: c.primary }}>Qty</th>
                                <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-widest w-20" style={{ color: c.primary }}>Rate</th>
                                <th className="text-right py-2 px-2 text-[10px] font-semibold uppercase tracking-widest w-24" style={{ color: c.primary }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} style={{ borderBottom: `1px solid ${c.primary}15` }}>
                                    <td className="py-2.5 px-2 text-xs">{item.description || 'Item description'}</td>
                                    <td className="py-2.5 px-2 text-xs text-center opacity-60">{item.quantity}</td>
                                    <td className="py-2.5 px-2 text-xs text-right opacity-60">{formatCurrency(item.unitPrice, currencySymbol)}</td>
                                    <td className="py-2.5 px-2 text-xs text-right font-semibold">{formatCurrency(calculateItemTotal(item), currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <TotalsSidebar {...{ totals, settings, currencySymbol, c }} />
                <BottomSection {...{ settings, notes, c, company, isDark: false }} />

                {/* Bottom ornamental */}
                <div className="mt-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 7. TECH GRADIENT | Gradient banner, monospace number, modern grid
// ═══════════════════════════════════════════════════════════════════
function TechGradient({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm border border-gray-100 rounded-lg overflow-hidden" style={{ backgroundColor: c.background, color: c.text }}>
            {/* Gradient banner */}
            <div className="p-6 pb-5" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
                <div className="flex justify-between items-start">
                    <div>
                        <Logo src={company.logo} size={36} className="rounded mb-2" />
                        <h1 className="text-xl font-bold text-white">INVOICE</h1>
                    </div>
                    <div className="text-right text-white">
                        <p className="font-mono text-xs bg-white/20 px-2 py-1 rounded-md inline-block">{invoiceNumber || 'INV-00000'}</p>
                        <p className="font-semibold text-sm mt-2">{company.name || 'Your Company'}</p>
                        {company.email && <p className="text-xs text-white/70">{company.email}</p>}
                    </div>
                </div>
            </div>

            {/* Info grid - 3 equal columns */}
            <div className="grid grid-cols-3 border-b border-gray-200">
                <div className="p-4 border-r border-gray-200">
                    <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1">Bill To</p>
                    <p className="font-semibold text-xs">{client.name || 'Client Name'}</p>
                    {client.address && <p className="text-[11px] opacity-50">{client.address}</p>}
                    {client.email && <p className="text-[11px] opacity-50">{client.email}</p>}
                </div>
                <div className="p-4 border-r border-gray-200">
                    <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1">Issue Date</p>
                    <p className="text-xs font-medium">{fmtDate(issueDate)}</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1 mt-2">Due Date</p>
                    <p className="text-xs font-medium">{fmtDate(dueDate)}</p>
                </div>
                <div className="p-4 flex flex-col justify-center items-center" style={{ backgroundColor: `${c.primary}08` }}>
                    <p className="text-[10px] uppercase tracking-wider opacity-30 mb-1">Amount Due</p>
                    <p className="text-lg font-bold" style={{ color: c.primary }}>{formatCurrency(totals.total, currencySymbol)}</p>
                </div>
            </div>

            <div className="p-5">
                {/* Rounded table */}
                <div className="mb-5 rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: c.primary }}>
                                <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white">#</th>
                                <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white">Description</th>
                                <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white w-12">Qty</th>
                                <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white w-20">Rate</th>
                                <th className="text-right py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                    <td className="py-2.5 px-3 text-xs font-mono opacity-40">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="py-2.5 px-3 text-xs">{item.description || 'Item description'}</td>
                                    <td className="py-2.5 px-2 text-xs text-center opacity-70">{item.quantity}</td>
                                    <td className="py-2.5 px-2 text-xs text-right opacity-70">{formatCurrency(item.unitPrice, currencySymbol)}</td>
                                    <td className="py-2.5 px-3 text-xs text-right font-semibold">{formatCurrency(calculateItemTotal(item), currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <TotalsSidebar {...{ totals, settings, currencySymbol, c }} />
                <BottomSection {...{ settings, notes, c, company, isDark: false }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// 8. CLASSIC FORMAL | Double-bordered, traditional structure, serif feel
// ═══════════════════════════════════════════════════════════════════
function ClassicFormal({ company, client, items, settings, invoiceNumber, issueDate, dueDate, notes, totals, c, currencySymbol }: TemplateProps) {
    return (
        <div className="min-h-[600px] text-sm rounded-lg overflow-hidden" style={{ backgroundColor: c.background, color: c.text, border: `3px double ${c.primary}` }}>
            <div className="p-6">
                {/* Header with double bottom border */}
                <div className="pb-4 mb-5" style={{ borderBottom: `3px double ${c.primary}` }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Logo src={company.logo} size={48} className="rounded" />
                            <div>
                                <p className="font-bold text-lg">{company.name || 'Your Company'}</p>
                                {company.address && <p className="text-xs opacity-60">{company.address}</p>}
                                <div className="flex gap-3">
                                    {company.email && <p className="text-xs opacity-60">{company.email}</p>}
                                    {company.phone && <p className="text-xs opacity-60">{company.phone}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold tracking-wide" style={{ color: c.primary, fontVariant: 'small-caps' }}>Invoice</h1>
                        </div>
                    </div>
                </div>

                {/* Invoice details in a formal box */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div className="p-3 border rounded" style={{ borderColor: `${c.primary}40` }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: c.primary }}>Bill To</h3>
                        <p className="font-semibold">{client.name || 'Client Name'}</p>
                        {client.address && <p className="text-xs opacity-60">{client.address}</p>}
                        {client.email && <p className="text-xs opacity-60">{client.email}</p>}
                        {client.phone && <p className="text-xs opacity-60">{client.phone}</p>}
                    </div>
                    <div className="p-3 border rounded" style={{ borderColor: `${c.primary}40` }}>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold" style={{ color: c.primary }}>Invoice No:</span>
                                <span className="font-mono">{invoiceNumber || 'INV-00000'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold" style={{ color: c.primary }}>Issue Date:</span>
                                <span>{fmtDateShort(issueDate)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold" style={{ color: c.primary }}>Due Date:</span>
                                <span>{fmtDateShort(dueDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Traditional bordered table */}
                <div className="mb-5">
                    <table className="w-full" style={{ border: `1px solid ${c.primary}40` }}>
                        <thead>
                            <tr style={{ backgroundColor: `${c.primary}10`, borderBottom: `2px solid ${c.primary}` }}>
                                <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: c.primary, borderRight: `1px solid ${c.primary}20` }}>No.</th>
                                <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: c.primary, borderRight: `1px solid ${c.primary}20` }}>Description</th>
                                <th className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider w-12" style={{ color: c.primary, borderRight: `1px solid ${c.primary}20` }}>Qty</th>
                                <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider w-20" style={{ color: c.primary, borderRight: `1px solid ${c.primary}20` }}>Unit Price</th>
                                <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider w-24" style={{ color: c.primary }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ borderBottom: `1px solid ${c.primary}15` }}>
                                    <td className="py-2 px-3 text-xs text-center opacity-50" style={{ borderRight: `1px solid ${c.primary}10` }}>{i + 1}</td>
                                    <td className="py-2 px-3 text-xs" style={{ borderRight: `1px solid ${c.primary}10` }}>{item.description || 'Item description'}</td>
                                    <td className="py-2 px-2 text-xs text-center opacity-70" style={{ borderRight: `1px solid ${c.primary}10` }}>{item.quantity}</td>
                                    <td className="py-2 px-2 text-xs text-right opacity-70" style={{ borderRight: `1px solid ${c.primary}10` }}>{formatCurrency(item.unitPrice, currencySymbol)}</td>
                                    <td className="py-2 px-3 text-xs text-right font-medium">{formatCurrency(calculateItemTotal(item), currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals in formal box */}
                <div className="flex justify-end mb-5">
                    <div className="w-60 border rounded p-3" style={{ borderColor: `${c.primary}40` }}>
                        <div className="flex justify-between py-1 text-xs"><span className="opacity-60">Subtotal</span><span>{formatCurrency(totals.subtotal, currencySymbol)}</span></div>
                        {settings.discountEnabled && totals.discount > 0 && (
                            <div className="flex justify-between py-1 text-xs text-green-600"><span>Discount ({settings.discountRate}%)</span><span>-{formatCurrency(totals.discount, currencySymbol)}</span></div>
                        )}
                        {settings.taxEnabled && totals.tax > 0 && (
                            <div className="flex justify-between py-1 text-xs"><span className="opacity-60">Tax ({settings.taxRate}%)</span><span>{formatCurrency(totals.tax, currencySymbol)}</span></div>
                        )}
                        <div className="flex justify-between py-2 mt-1 font-bold text-sm" style={{ borderTop: `2px solid ${c.primary}`, color: c.primary }}>
                            <span>Total</span><span>{formatCurrency(totals.total, currencySymbol)}</span>
                        </div>
                    </div>
                </div>

                <BottomSection {...{ settings, notes, c, company, isDark: false }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════════════
function TotalsSidebar({ totals, settings, currencySymbol, c }: { totals: InvoiceTotals; settings: InvoiceData['settings']; currencySymbol: string; c: InvoiceColors }) {
    return (
        <div className="flex justify-end mb-6">
            <div className="w-52 space-y-1.5">
                <div className="flex justify-between py-1">
                    <span className="text-xs opacity-60">Subtotal</span>
                    <span className="text-xs font-medium">{formatCurrency(totals.subtotal, currencySymbol)}</span>
                </div>
                {settings.discountEnabled && totals.discount > 0 && (
                    <div className="flex justify-between py-1 text-green-600">
                        <span className="text-xs">Discount ({settings.discountRate}%)</span>
                        <span className="text-xs font-medium">-{formatCurrency(totals.discount, currencySymbol)}</span>
                    </div>
                )}
                {settings.taxEnabled && totals.tax > 0 && (
                    <div className="flex justify-between py-1">
                        <span className="text-xs opacity-60">Tax ({settings.taxRate}%)</span>
                        <span className="text-xs font-medium">{formatCurrency(totals.tax, currencySymbol)}</span>
                    </div>
                )}
                <div className="flex justify-between py-2 border-t-2 mt-2" style={{ borderColor: c.primary }}>
                    <span className="font-bold" style={{ color: c.primary }}>Total</span>
                    <span className="font-bold" style={{ color: c.primary }}>{formatCurrency(totals.total, currencySymbol)}</span>
                </div>
            </div>
        </div>
    );
}

function BottomSection({ settings, notes, c, company, isDark }: { settings: InvoiceData['settings']; notes: string; c: InvoiceColors; company: InvoiceData['company']; isDark: boolean }) {
    const bgColor = isDark ? c.secondary : '#f3f4f6';
    const borderColor = isDark ? c.secondary : '#e5e7eb';

    return (
        <>
            {settings.showPaymentTerms && settings.paymentTerms && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Payment Terms</h4>
                    <p className="text-xs">{settings.paymentTerms}</p>
                </div>
            )}
            {settings.showBankDetails && settings.bankDetails && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Bank Details</h4>
                    <p className="text-xs whitespace-pre-wrap">{settings.bankDetails}</p>
                </div>
            )}
            {notes && (
                <div className="pt-4 border-t" style={{ borderColor }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Notes</h4>
                    <p className="text-xs whitespace-pre-wrap opacity-70">{notes}</p>
                </div>
            )}
            <div className="mt-6 pt-4 text-center border-t" style={{ borderColor }}>
                <p className="text-[10px] opacity-40">Thank you for your business!</p>
                {company.website && <p className="text-[10px] opacity-40 mt-0.5">{company.website}</p>}
            </div>
        </>
    );
}
